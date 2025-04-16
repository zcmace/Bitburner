import {NS} from '@ns';
import {calculateHWGWByHackPercent} from "@/bb-3/hwgw";

export async function main(ns: NS) {
    const flags = ns.flags([
        ['target', ''],
        ['offset', 0],
        ['instances', 0]
    ]);
    const target = flags['target'] as string;
    if (!target) {
        ns.tprint('No target specified');
        ns.exit();
    }

    const targetServer = ns.getServer(target);
    const runner = ns.getServer();
    const player = ns.getPlayer();

    const hackFormula = calculateHWGWByHackPercent(targetServer, runner, player, 0.1, ns, false);
    const hackTime = ns.formulas.hacking.hackTime(targetServer, player);
    const weakenTime = ns.formulas.hacking.weakenTime(targetServer, player);
    //500 ms delay to be sure no hwgw processes are completing at the same time. This is the amount of time in MS we can schedule processes in
    const totalProcessTime = (hackFormula.hackWait + hackTime) - 500;
    //This is the time it takes for 1 hwgw loop to finish all four of its processes, once they begin completing.
    const totalCycleTime = (hackFormula.weaken2Wait + weakenTime) - (hackFormula.hackWait + hackTime);
    //This is the total HWGW loops that can be executed against a certain target, for a hwgw to be constantly completing.
    const totalHWGWloops = Math.floor(totalProcessTime / totalCycleTime);

    const hackMemPerHWGW = ns.getScriptRam('./hack.js') * hackFormula.hackThreads;
    const growMemPerHWGW = ns.getScriptRam('./grow.js') * hackFormula.growThreads;
    const weakenMemPerHWGW = ns.getScriptRam('./weaken.js') * (hackFormula.weaken1Threads + hackFormula.weaken2Threads);
    const memPerHWGWLoop = hackMemPerHWGW + growMemPerHWGW + weakenMemPerHWGW;
    const memToMaxTarget = totalHWGWloops * memPerHWGWLoop;

    const runnerRamAvailable = runner.maxRam - runner.ramUsed;
    if (runnerRamAvailable < memToMaxTarget) {
        const instances = Math.floor(runnerRamAvailable / memPerHWGWLoop);
        ns.printf('Not enough ram to execute max instances, using runner maximum instead.', target, instances);
        await launchHWGWInstances(target, totalCycleTime, instances, ns);
        ns.exit();
    }
    await launchHWGWInstances(target, totalCycleTime, totalHWGWloops, ns);
}

export async function launchHWGWInstances(target: string, offset: number, instances: number, ns: NS) {
    ns.tprintf('Executing %s instances of HWGW on %s with offset %d', instances, target, offset);
    for (let i = 0; i < instances; i++) {
        ns.tprintf('Starting instance %d', i + 1);
        ns.exec('./hwgw.js', ns.getHostname(), 1, '--target', target);
        await ns.sleep(offset);
    }
}