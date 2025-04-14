import { NS, Player, Server } from '@ns';

export async function main(ns: NS) {
  const flags = ns.flags([['target', '']]);

  const target = flags['target'] as string;
  if (!target) {
    ns.printf('No target specified. Exiting');
    ns.exit();
  }
  const player: Player = ns.getPlayer();
  const runner = ns.getServer();

  await weakenServerToMin(target, runner, player, ns);
  await growServerToMax(target, runner, player, ns);
  runHGWGLoop(target, runner, ns);
}

async function weakenServerToMin(target: string, runner: Server, player: Player, ns: NS) {
  const targetServer = ns.getServer(target);
  let secDifference = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
  if (secDifference <= 0) {
    return;
  }
  const weakenThreadsRequired = Math.ceil(secDifference / 0.05);
  const weakenTime = ns.formulas.hacking.weakenTime(targetServer, player);
  const scriptRam = ns.getScriptRam('weaken.js');
  const runnerAvailableRam = runner.maxRam - runner.ramUsed;
  const availableThreads = Math.floor(runnerAvailableRam / scriptRam);
  //If we have the weaken threads required do full weaken
  if (availableThreads >= weakenThreadsRequired) {
    const pid = ns.exec('./weaken.js', runner.hostname, weakenThreadsRequired, '--target', target);
    while (ns.isRunning(pid)) {
      await ns.sleep(1000);
    }
    return;
  }

  //if not do required iterations of available threads
  while (secDifference > 0) {
    const pid = ns.exec('./weaken.js', runner.hostname, availableThreads);
    while (ns.isRunning(pid)) {
      await ns.sleep(1000);
    }
    secDifference -= availableThreads * 0.05;
    if (secDifference <= 0) {
      return;
    }
  }
}

async function growServerToMax(target: string, runner: Server, player: Player, ns: NS) {
  const targetServer = ns.getServer(target);
  const growTime = ns.formulas.hacking.growTime(targetServer, player);
  const weakenTime = ns.formulas.hacking.weakenTime(targetServer, player);
}

function runHGWGLoop(target: string, runner: Server, ns: NS) {}
