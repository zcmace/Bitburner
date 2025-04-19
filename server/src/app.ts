import express from "express";
import ServerController from "./servers/controller";
import serverRouter from "./servers/router";
import {getDatabase} from "./database";


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

async function startServer() {
    try {
        const db = await getDatabase();

        // Create controller instances
        const serverController = new ServerController(db);

        // Store controllers in app.locals for access in routes
        app.locals.serverController = serverController;

        // Apply routes
        app.use('/servers', serverRouter);

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        process.exit(1);
    }
}

// Call the async function
startServer();

