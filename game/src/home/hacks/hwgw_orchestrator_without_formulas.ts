import {NS} from '@ns';
import {calculateHWGWByHackPercent} from "@/home/hacks/hwgw_without_formulas";

export async function main(ns: NS) {
    const flags = ns.flags([
        ['target', ''],
    ]);
    const target = flags['target'] as string;
    if (!target) {
        ns.tprint('No target specified');
        ns.exit();
    }
    ns.ui.openTail();
    const targetServer = ns.getServer(target);
    const runner = ns.getServer();
    const player = ns.getPlayer();

    const hackFormula = calculateHWGWByHackPercent(targetServer, runner, player, 0.1, ns, false);
    const hackTime = ns.getHackTime(target);
    const weakenTime = ns.getWeakenTime(target)
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

async function launchHWGWInstances(target: string, offset: number, instances: number, ns: NS) {
    ns.printf('Executing %s instances of HWGW on %s with offset %d', instances, target, offset);
    for (let i = 0; i < instances; i++) {
        ns.printf('Starting instance %d', i + 1);
        ns.exec('./hwgw_without_formulas.js', ns.getHostname(), 1, '--target', target);
        await ns.sleep(offset);
    }
}