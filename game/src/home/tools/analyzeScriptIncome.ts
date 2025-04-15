import {NS} from '@ns';

export async function main(ns: NS) {
    const host = ns.args[0] as string;
    const script = ns.args[1] as string;
    if (!host) {
        ns.tprint('No host specified');
        ns.exit();
    }
    const runningScript = ns.getRunningScript(script, host, ...ns.args.slice(2));
    ns.tprintf('Running script %s on %s', script, host);
    ns.tprintf('Args: %s', ns.args.slice(2));
    ns.tprint(runningScript)
    const mainScript = runningScript?.parent
    ns.tprintf('Parent script: %s', ns.getRunningScript(mainScript));
}