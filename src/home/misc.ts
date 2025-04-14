import { NS } from '@ns';

export async function main(ns: NS) {
  ns.print(ns.formatNumber(ns.getPurchasedServerUpgradeCost('home-2', 256)));
  const target = ns.getServer(ns.args[0] as string);
  const player = ns.getPlayer();
  const home = ns.getServer();
  const formula = ns.formulas.hacking;
  const minDiff = ns.getServerMinSecurityLevel(target.hostname);
  const currDiff = ns.getServerSecurityLevel(target.hostname);

  //times
  const hackTime = formula.hackTime(target, player);
  const weakenTime = formula.weakenTime(target, player);
  const growTime = formula.growTime(target, player);

  //prep
  const weakenThreads = (currDiff - minDiff) / 0.05;
  const growThreadsPrep = formula.growThreads(target, player, ns.getServerMaxMoney(target.hostname), 2);
  const growSecOffset = growThreadsPrep * 0.004;
  const weakenSecOffsetGrowPrep = growSecOffset / 0.05;

  // The below is correct in general but should be tested.
  // Grow to Weaken threads proportion is 2 weaken thread per 25 grow threads
  // Hack to weaken threads proportion is 1 weaken thread per 25 hack threads

  //Runner Limitations
  ns.tprintf('\nThis Server Thread Maximums: \n');
  const hackMem = ns.getScriptRam('/hacks/hack.js');
  const growMem = ns.getScriptRam('/hacks/grow.js');
  const maxHackThreads = Math.floor(home.maxRam / ns.getScriptRam('/hacks/hack.js'));
  const maxGrowThreads = Math.floor(home.maxRam / ns.getScriptRam('/hacks/grow.js'));
  ns.tprintf('Max Hack Threads: %s at %s gb per thread', maxHackThreads, hackMem);
  ns.tprintf('Max Grow/Weaken Threads: %s at %s gb per thread', maxGrowThreads, growMem);

  ns.tprintf('\nPrep Threads: \n');
  ns.tprintf('WeakenThreads to prep grow: %s', weakenThreads);
  ns.tprintf('GrowThreads to prep: %s', growThreadsPrep);
  ns.tprintf('WeakenThreads to mitigate grow prep: %s', weakenSecOffsetGrowPrep);

  const amountToHack = ns.getServerMaxMoney(target.hostname) * 0.1;
  const temp = target.moneyAvailable;
  target.moneyAvailable = ns.getServerMaxMoney(target.hostname);
  const hackThreadsFor10Perc = Math.ceil(0.1 / formula.hackPercent(target, player));
  const hackOffset = hackThreadsFor10Perc * 0.002;
  const weakenThreadsToOffsetHack = hackOffset / 0.05;
  target.moneyAvailable = target.moneyAvailable * 0.9;
  const growThreadsToOffsetHack = formula.growThreads(target, player, ns.getServerMaxMoney(target.hostname), 2);
  const weakenThreadsToOffsetGrow = Math.ceil((growThreadsToOffsetHack * 0.004) / 0.05);
  target.moneyAvailable = temp;
  const hackWait = weakenTime - hackTime;
  const firstWeakenWait = 500;
  const growWait = weakenTime - growTime + 1000;
  const finalWeakenWait = 1500;

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
    formatTime(firstWeakenWait),
    formatTime(weakenTime + firstWeakenWait),
  );
  ns.tprintf(
    'Grow Time: %s | Offset: %s | Total: %s',
    formatTime(growTime),
    formatTime(growWait),
    formatTime(growTime + growWait),
  );
  ns.tprintf(
    'Weaken #2 Time: %s | Offset: %s | Total: %s',
    formatTime(finalWeakenWait),
    formatTime(hackWait),
    formatTime(weakenTime + finalWeakenWait),
  );

  ns.tprintf(
    '\nOffsets:\nHack: \t\t%s\nWeaken #1: \t%s\nGrow: \t\t%s\nWeaken #2: \t%s',
    Math.ceil(hackWait),
    firstWeakenWait,
    Math.ceil(growWait),
    finalWeakenWait,
  );

  ns.tprintf(
    '\nThreads: \nHack: \t\t%s\nWeaken #1: \t%s\nGrow: \t\t%s\nWeaken #2: \t%s\nTotal: \t\t%s',
    Math.ceil(hackThreadsFor10Perc),
    Math.ceil(weakenThreadsToOffsetHack),
    Math.ceil(growThreadsToOffsetHack),
    Math.ceil(weakenThreadsToOffsetGrow),
    Math.ceil(hackThreadsFor10Perc + weakenThreadsToOffsetHack + growThreadsToOffsetHack + weakenThreadsToOffsetGrow),
  );

  ns.tprintf(
    '\nRAM Usage: \nHack: \t\t%s\nWeaken #1: \t%s\nGrow: \t\t%s\nWeaken #2: \t%s\nTotal: \t\t%s',
    Math.ceil(hackThreadsFor10Perc) * hackMem,
    Math.ceil(weakenThreadsToOffsetHack) * growMem,
    Math.ceil(growThreadsToOffsetHack) * growMem,
    Math.ceil(weakenThreadsToOffsetGrow) * growMem,
    Math.ceil(hackThreadsFor10Perc) * hackMem +
      Math.ceil(weakenThreadsToOffsetHack) * growMem +
      Math.ceil(growThreadsToOffsetHack) * growMem +
      Math.ceil(weakenThreadsToOffsetGrow) * growMem,
  );

  ns.tprintf('Hack Chance: %s', ns.formulas.hacking.hackChance(target, player));
}

function formatTime(timeInMs: number) {
  const hoursPart: number = Math.floor(timeInMs / (1000 * 60 * 60));
  const minutesPart: number = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));
  const secPart: number = Math.floor((timeInMs % (1000 * 60)) / 1000);
  const msPart: number = timeInMs % 1000;
  return `${hoursPart}:${minutesPart}:${secPart}.${Math.ceil(msPart)}`;
}
