import {NS, Server} from '@ns';
import {createServer} from "@/home/database/servers";

/**
 * The main entry point for the script. Scans the network, attempts to crack hosts up to a specified depth,
 * and writes the list of cracked hosts to a file.
 *
 * @param {NS} ns - The NS API object used to interact with the game world.
 *
 * Flags:
 * - `-h`: (Optional) The starting hostname from which to begin scanning. Defaults to the current server's hostname.
 * - `-d`: (Optional) The maximum depth for recursive scanning. Defaults to `5` if not provided.
 *
 * Functionality:
 * - Scans for connected hosts starting at `-h` (or the current hostname if `-h` is not provided).
 * - Attempts to crack connected hosts and recursively explores up to the depth specified by `-d`.
 * - Writes the list of successfully cracked hosts to `/data/cracked_hosts.txt`.
 */

export async function main(ns: NS) {
    const flags = ns.flags([
        ['h', ''],
        ['d', 0],
    ]);

    const rootHost = (flags['h'] as string) || ns.getHostname();
    const maxDepth = (flags['d'] as number) || 5;
    const crackedHosts: string[] = recursiveCrack(rootHost, 0, maxDepth, ns);
    const servers: Server[] = crackedHosts.map((host) => ns.getServer(host));
    for (let server of servers) {
        try {
            const response = await createServer(server);
            if (response.hostname) {
                ns.tprintf('Successfully stored cracked server %s in database', server.hostname);
                continue;
            }
            ns.tprintf('Failed to store cracked server %s in database', server.hostname);
        } catch (e) {
            ns.tprintf('Cracked server %s already in database', server.hostname);
        }
    }
}

function recursiveCrack(
    rootHost: string,
    depth: number,
    maxDepth: number,
    ns: NS,
    visitedHosts: Set<string> = new Set(),
): string[] {
    // Exit condition for recursion
    if (depth > maxDepth) {
        return [];
    }

    // Add rootHost to visitedHosts to avoid processing it again
    visitedHosts.add(rootHost);
    // Array to store the cracked hosts in this iteration
    const crackedHosts: string[] = [];
    // Scan connected hosts from the current rootHost
    const connectedHosts = ns.scan(rootHost);
    for (const host of connectedHosts) {
        // Skip already visited hosts or 'home'
        if (visitedHosts.has(host) || host === 'home') {
            continue;
        }
        // Mark host as visited
        visitedHosts.add(host);
        // Attempt to crack the host
        const success: boolean = attemptCrack(host, ns);
        if (success) {
            crackedHosts.push(host); // Add to the cracked list if access is obtained
            // Recurse into the connected host
            const hostsFromRecursion = recursiveCrack(host, depth + 1, maxDepth, ns, visitedHosts);
            // Merge the returned array from recursion with the cracked list
            crackedHosts.push(...hostsFromRecursion);
        }
    }
    return crackedHosts;
}

function attemptCrack(host: string, ns: NS): boolean {
    return ns.hasRootAccess(host) || tryToCrackHost(host, ns);
}

function tryToCrackHost(host: string, ns: NS): boolean {
    // Try cracking methods if available, then nuke on host.
    try {
        if (ns.fileExists('BruteSSH.exe', 'home')) ns.brutessh(host);
        if (ns.fileExists('FTPCrack.exe', 'home')) ns.ftpcrack(host);
        if (ns.fileExists('HTTPWorm.exe', 'home')) ns.httpworm(host);
        if (ns.fileExists('SQLInject.exe', 'home')) ns.sqlinject(host);
        if (ns.fileExists('relaySMTP.exe', 'home')) ns.relaysmtp(host);

        ns.nuke(host);
        return ns.hasRootAccess(host); // Check if access was successfully gained
    } catch (e) {
        ns.tprint(`Error cracking host ${host}: ${e}`);
        return false;
    }
}
