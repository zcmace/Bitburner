import express, {Request, RequestHandler, Response} from 'express';
import ServerController from './controller';
import {Server} from '../../NetscriptDefinitions';
import {Connect} from 'vite';
import NextFunction = Connect.NextFunction;

const serverRouter = express.Router();

// Helper function to wrap async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Create a new server
serverRouter.post(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const serverController = req.app.locals.serverController as ServerController;
        const serverData: Server = req.body;

        // Validate required fields
        if (!serverData.hostname) {
            return res.status(400).json({error: 'Server hostname is required'});
        }

        const server = await serverController.createServer(serverData);
        res.status(201).json(server);
    }),
);

/**
 * GET /servers
 * Get all servers
 */
serverRouter.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const serverController = req.app.locals.serverController as ServerController;
        const servers = await serverController.getAllServers();
        res.json(servers);
    }),
);

// Get a specific server by hostname
serverRouter.get(
    '/:hostname',
    asyncHandler(async (req: Request, res: Response) => {
        const serverController = req.app.locals.serverController as ServerController;
        const {hostname} = req.params;

        const server = await serverController.getServer(hostname);
        if (!server) {
            return res.status(404).json({error: 'Server not found'});
        }

        res.json(server);
    }),
);

// Update a server by hostname
serverRouter.put(
    '/:hostname',
    asyncHandler(async (req: Request, res: Response) => {
        const serverController = req.app.locals.serverController as ServerController;
        const updatedServerData: Server = req.body;

        // Check if the server exists
        const existingServer = await serverController.getServer(updatedServerData.hostname);
        if (!existingServer) {
            return res.status(404).json({error: 'Server not found'});
        }

        // Update the server
        const updatedServer = await serverController.updateServer(updatedServerData);
        res.json(updatedServer);
    }),
);

// Delete a server by hostname
serverRouter.delete(
    '/:hostname',
    asyncHandler(async (req: Request, res: Response) => {
        const serverController = req.app.locals.serverController as ServerController;
        const {hostname} = req.params;

        // Check if the server exists
        const existingServer = await serverController.getServer(hostname);
        if (!existingServer) {
            return res.status(404).json({error: 'Server not found'});
        }

        // Delete the server
        try {
            await serverController.deleteServer(hostname);
            res.status(204).send(); // No content response for successful deletion
        } catch (error) {
            console.log(error)
            res.status(500).send(error);
        }
    }),
);

// Delete a server by hostname
serverRouter.delete(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const serverController = req.app.locals.serverController as ServerController;
        // Delete all servers
        await serverController.deleteAllServers()
        res.status(204).send(); // No content response for successful deletion
    }),
);

export default serverRouter;
