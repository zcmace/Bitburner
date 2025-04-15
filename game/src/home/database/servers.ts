// Example functions
import {Server} from "@ns";

export async function createServer(server: Server): Promise<Server> {
    const response: Response = await fetch('http://localhost:3000/servers', {
        method: 'POST',
        body: JSON.stringify(server),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

export async function getAllServers(): Promise<Server[]> {
    const response: Response = await fetch('http://localhost:3000/servers');
    return response.json();
}

export async function getServer(host: string): Promise<Server> {
    const response: Response = await fetch(`http://localhost:3000/servers/${host}`);
    return response.json();
}

export async function updateServer(server: Server): Promise<void> {
    const response: Response = await fetch(`http://localhost:3000/servers`, {
        method: 'PUT',
        body: JSON.stringify(server),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

export async function deleteServer(host: string): Promise<boolean> {
    const response: Response = await fetch(`http://localhost:3000/servers/${host}`, {
        method: 'DELETE'
    });
    return response.status == 204;
}

