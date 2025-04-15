import {NS} from '@ns';

export async function main(ns: NS) {
    const flags = ns.flags([
        ['target', ''],
        ['offset', 2000],
        ['instances', 1]
    ]);
    const target = flags['target'] as string;
    const offset = flags['offset'] as number;
    const instances = flags['instances'] as number;

    if (!target) {
        ns.tprint('No target specified');
        ns.exit();
    }
    ns.tprintf('Executing %s instances of HWGW on %s with offset %d', instances, target, offset);
    for (let i = 0; i < instances; i++) {
        ns.tprintf('Starting instance %d', i + 1);
        ns.exec('./hwgw.js', ns.getHostname(), 1, '--target', target);
        await ns.sleep(offset);
    }
}