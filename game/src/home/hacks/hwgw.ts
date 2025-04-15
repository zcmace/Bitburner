import {NS, Player, Server} from '@ns';


interface HackingFormula {
    hackWait: number;
    hackThreads: number;
    weaken1Threads: number;
    weaken1Wait: number;
    growWait: number;
    growThreads: number;
    weaken2Threads: number;
    weaken2Wait: number;
}

interface PrepFormula {
    weaken1Threads: number;
    weaken1Wait: number;
    growThreads: number;
    growWait: number;
    weaken2Threads: number;
    weaken2Wait: number;
}

interface ScriptRunInfo {
    hackTime: number;
    growTime: number;
    weakenTime: number;
    growMem: number;
    hackMem: number;
}

export async function main(ns: NS) {
    const flags = ns.flags([
        ['target', ''],
        ['debug', false],
        ['hackPercent', 0.1]
    ])
    const target = flags['target'] as string;
    const debug = flags['debug'] as boolean;
    const hackPercent = flags['hackPercent'] as number;
    if (hackPercent == 0.1) {
        ns.tprint('Hack Percent defaulting to 10%');
    }
    const runner = ns.getServer();
    const player = ns.getPlayer();
    if (!target) {
        ns.tprint('No target specified');
        return;
    }
    const targetServer = ns.getServer(target)

    if (debug) {
        const cyan = "\u001b[36m";
        const reset = "\u001b[0m";
        ns.tprint(`\n${cyan}Running in debug mode. No scripts will be executed.${reset}\n`)
        calculatePrep(targetServer, runner, player, ns, debug);
        calculateHWGWByHackPercent(targetServer, runner, player, hackPercent, ns, debug);
        ns.exit();
    }


    await prepServer(targetServer, runner, player, ns, debug);
    await runHWGWLoop(targetServer, runner, player, hackPercent, ns, debug);
}

async function runHWGWLoop(target: Server, runner: Server, player: Player, hackPercent: number, ns: NS, debug: boolean): Promise<void> {
    while (true) {
        const formula = calculateHWGWByHackPercent(target, runner, player, hackPercent, ns, debug);
        const hack = ns.exec('/hacks/hack.js', runner.hostname, formula.hackThreads, '--target', target.hostname, '--wait', formula.hackWait);
        const weaken1 = ns.exec('/hacks/weaken.js', runner.hostname, formula.weaken1Threads, '--target', target.hostname, '--wait', formula.weaken1Wait);
        const grow = ns.exec('/hacks/grow.js', runner.hostname, formula.growThreads, '--target', target.hostname, '--wait', formula.growWait);
        const weaken2 = ns.exec('/hacks/weaken.js', runner.hostname, formula.weaken2Threads, '--target', target.hostname, '--wait', formula.weaken2Wait);
        if (!hack || !weaken1 || !grow || !weaken2) {
            ns.tprintf('Failed to start 1 or more HWGW scripts. Exiting script.');
            ns.exit();
        }
        while (ns.isRunning(hack) || ns.isRunning(weaken1) || ns.isRunning(grow) || ns.isRunning(weaken2)) {
            await ns.sleep(1000);
        }
    }
}

async function prepServer(target: Server, runner: Server, player: Player, ns: NS, debug: boolean): Promise<void> {
    const formula = calculatePrep(target, runner, player, ns, debug);
    if ((formula.weaken1Threads + formula.weaken2Threads + formula.growThreads) == 0) {
        ns.tprint('Server is already prepared. Skipping prep.');
        return;
    }
    const weaken1 = ns.exec('/hacks/weaken.js', runner.hostname, formula.weaken1Threads, '--target', target.hostname, '--wait', formula.weaken1Wait);
    const grow = ns.exec('/hacks/grow.js', runner.hostname, formula.growThreads, '--target', target.hostname, '--wait', formula.growWait);
    const weaken2 = ns.exec('/hacks/weaken.js', runner.hostname, formula.weaken2Threads, '--target', target.hostname, '--wait', formula.weaken2Wait);
    if (!weaken1 || !grow || !weaken2) {
        ns.tprintf('Failed to start 1 or more prep scripts. Exiting script.');
        ns.exit();
    }
    while (ns.isRunning(weaken1) || ns.isRunning(grow) || ns.isRunning(weaken2)) {
        await ns.sleep(1000);
    }
}


function calculatePrep(target: Server, runner: Server, player: Player, ns: NS, debug: boolean): PrepFormula {
    const minSecLevel = ns.getServerMinSecurityLevel(target.hostname);
    const currSecLevel = ns.getServerSecurityLevel(target.hostname);
    const secDifference = currSecLevel - minSecLevel;
    const f = ns.formulas.hacking;
    //times
    const weakenTime = f.weakenTime(target, player);
    const growTime = f.growTime(target, player);
    //build formula
    const result: Partial<PrepFormula> = {};
    result.weaken1Threads = Math.ceil((currSecLevel - minSecLevel) / 0.05);
    result.weaken1Wait = 0;
    result.growThreads = f.growThreads(target, player, ns.getServerMaxMoney(target.hostname), runner.cpuCores);
    const growSecOffset = result.growThreads * 0.004;
    result.growWait = (weakenTime - growTime) + 500;
    result.weaken2Threads = Math.ceil(growSecOffset / 0.05);
    result.weaken2Wait = 1000;
    if (debug) {
        ns.tprint('\nPrep Formula:\n')
        ns.tprintf('Weaken #1 Threads: %s', result.weaken1Threads);
        ns.tprintf('Weaken #1 Wait: %s', result.weaken1Wait);
        ns.tprintf('Grow Threads: %s', result.growThreads);
        ns.tprintf('Grow Wait: %s', result.growWait);
        ns.tprintf('Weaken #2 Threads: %s', result.weaken2Threads);
        ns.tprintf('Weaken #2 Wait: %s', result.weaken2Wait);
    }
    return result as PrepFormula;
}

function calculateHWGWByHackPercent(target: Server, runner: Server, player: Player, hackPercent: number, ns: NS, debug: boolean): HackingFormula {
    const f = ns.formulas.hacking;
    //times
    const hackTime = f.hackTime(target, player);
    const weakenTime = f.weakenTime(target, player);
    const growTime = f.growTime(target, player);
    // The below is correct in general but should be tested.
    // Grow to Weaken threads proportion is 2 weaken thread per 25 grow threads
    // Hack to weaken threads proportion is 1 weaken thread per 25 hack threads
    //Runner Limitations
    const hackMem = ns.getScriptRam('/hacks/hack.js');
    const growMem = ns.getScriptRam('/hacks/grow.js');
    const maxHackThreads = Math.floor(runner.maxRam / ns.getScriptRam('/hacks/hack.js'));
    const maxGrowThreads = Math.floor(runner.maxRam / ns.getScriptRam('/hacks/grow.js'));
    if (debug) {
        ns.tprintf('\nThis Server Thread Maximums: \n');
        ns.tprintf('Max Hack Threads: %s at %s gb per thread', maxHackThreads, hackMem);
        ns.tprintf('Max Grow/Weaken Threads: %s at %s gb per thread', maxGrowThreads, growMem);
    }
    const moneyAvailable = ns.getServerMoneyAvailable(target.hostname);
    //setting hack threads to round down so that we don't slowly drain more than 10 percent
    const hackThreads = Math.floor(hackPercent / f.hackPercent(target, player)) || 0;
    const hackOffset = hackThreads * 0.002;
    const weaken1Threads = Math.ceil(hackOffset / 0.05);
    //setting targets moneyAvailable to projected amount after hacking for grow threads calculation
    target.moneyAvailable = moneyAvailable * (1 - (f.hackPercent(target, player) * hackThreads));
    const growThreads = f.growThreads(target, player, ns.getServerMaxMoney(target.hostname), runner.cpuCores);
    const growSecOffset = growThreads * 0.004;
    const weaken2Threads = Math.ceil(growSecOffset / 0.05);
    target.moneyAvailable = moneyAvailable;
    const hackWait = weakenTime - hackTime;
    const weaken1Wait = 500;
    const growWait = weakenTime - growTime + 1000;
    const weaken2Wait = 1500;
    const formula: HackingFormula = {hackThreads, hackWait, weaken1Threads, weaken1Wait, growThreads, growWait, weaken2Threads, weaken2Wait};
    if (debug) {
        printHackingFormulaDebug(formula, {hackMem, growMem, weakenTime, hackTime, growTime}, ns);
        ns.tprintf('Hack Chance: %s', f.hackChance(target, player));
    }
    return {hackThreads, hackWait, weaken1Threads, weaken1Wait, growThreads, growWait, weaken2Threads, weaken2Wait} as HackingFormula;
}

function formatTime(timeInMs: number) {
    const hoursPart: number = Math.floor(timeInMs / (1000 * 60 * 60));
    const minutesPart: number = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));
    const secPart: number = Math.floor((timeInMs % (1000 * 60)) / 1000);
    const msPart: number = timeInMs % 1000;
    return `${hoursPart}:${minutesPart}:${secPart}.${Math.ceil(msPart)}`;
}

function printHackingFormulaDebug(formula: HackingFormula, runInfo: ScriptRunInfo, ns: NS): void {
    const {
        hackWait,
        hackThreads,
        weaken1Threads,
        weaken1Wait,
        growWait,
        growThreads,
        weaken2Threads,
        weaken2Wait
    } = formula;

    const {
        hackTime,
        growTime,
        weakenTime,
        hackMem,
        growMem
    } = runInfo;

    ns.tprintf('\nStep times: \n');
    ns.tprintf(
        'Hack Time: %s | Offset: %s | Total: %s',
        formatTime(hackTime),
        formatTime(hackWait),
        formatTime(hackTime + hackWait),
    );
    ns.tprintf(
        'Weaken #1 Time: %s | Offset: %s | Total: %s',
        formatTime(weakenTime),
        formatTime(weaken1Wait),
        formatTime(weakenTime + weaken1Wait),
    );
    ns.tprintf(
        'Grow Time: %s | Offset: %s | Total: %s',
        formatTime(growTime),
        formatTime(growWait),
        formatTime(growTime + growWait),
    );
    ns.tprintf(
        'Weaken #2 Time: %s | Offset: %s | Total: %s',
        formatTime(weakenTime),
        formatTime(weaken2Wait),
        formatTime(weakenTime + weaken2Wait),
    );

    ns.tprintf(
        '\nOffsets:\nHack: \t\t%s\nWeaken #1: \t%s\nGrow: \t\t%s\nWeaken #2: \t%s',
        Math.ceil(hackWait),
        weaken1Wait,
        Math.ceil(growWait),
        weaken2Wait
    );
    ns.tprintf(
        '\nThreads: \nHack: \t\t%s\nWeaken #1: \t%s\nGrow: \t\t%s\nWeaken #2: \t%s\nTotal: \t\t%s',
        Math.ceil(hackThreads),
        Math.ceil(weaken1Threads),
        Math.ceil(growThreads),
        Math.ceil(weaken2Threads),
        Math.ceil(hackThreads + weaken1Threads + weaken2Threads + growThreads),
    );

    ns.tprintf(
        '\nRAM Usage: \nHack: \t\t%s\nWeaken #1: \t%s\nGrow: \t\t%s\nWeaken #2: \t%s\nTotal: \t\t%s',
        Math.ceil(hackThreads) * hackMem,
        Math.ceil(weaken1Threads) * growMem,
        Math.ceil(growThreads) * growMem,
        Math.ceil(weaken2Threads) * growMem,
        Math.ceil(hackThreads) * hackMem +
        Math.ceil(weaken1Threads) * growMem +
        Math.ceil(growThreads) * growMem +
        Math.ceil(weaken2Threads) * growMem,
    );
}
