import {NS} from '@ns';

export async function main(ns: NS) {
    const flags = ns.flags([
        ['target', ''],
        ['instances', 1],
        ['offset', 0],
        ['threads', 1]
    ]);

    const target = flags['target'] as string;
    const instances = flags['instances'] as number;
    const offset = flags['offset'] as number;
    const threads = flags['threads'] as number;

    if (!target) {
        ns.tprint('No target specified');
        ns.exit();
    }

    for (let i = 0; i < instances; i++) {
        ns.tprintf('Starting instance %d', i + 1);
        ns.exec('./safe_hack.js', ns.getHostname(), threads, '-h', target);
        await ns.sleep(offset);
    }
}