import {NS, Server} from '@ns';
import {getAllServers} from "@/home/database/servers";

export async function main(ns: NS) {
    const servers: Server[] = await getAllServers();
    for (const server of servers) {
    }
}