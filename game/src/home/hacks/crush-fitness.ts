import { NS } from '@ns';

export async function main(ns: NS) {
  const flags = ns.flags([['target', '']]);
  const host = flags['target'] as string;
  ns.tprint(host);
  const hackThreads = 200;
  const hackWeakThreads = 30;
  const growThreads = 800;
  const growWeakThreads = 210;
  const hackWait = 352540;
  const weak1Wait = 500;
  const growWait = 95011;
  const weak2Wait = 1500;
  const target = (flags['target'] || 'crush-fitness') as string;
  while (true) {
    const hackPid = ns.run('/hacks/hack.js', hackThreads, '--target', target, '--wait', hackWait);
    const weak1Pid = ns.run('/hacks/weaken.js', hackWeakThreads, '--target', target, '--wait', weak1Wait);
    const growPid = ns.run('/hacks/grow.js', growThreads, '--target', target, '--wait', growWait);
    const weak2Pid = ns.run('/hacks/weaken.js', growWeakThreads, '--target', target, '--wait', weak2Wait);

    if (hackPid === 0 || weak1Pid === 0 || growPid === 0 || weak2Pid === 0) {
      ns.kill(hackPid);
      ns.kill(weak1Pid);
      ns.kill(growPid);
      ns.kill(weak2Pid);
      ns.tprint('Failed to start 1 or more HWGW scripts. Stopping execution.');
      ns.exit();
    }

    while (ns.isRunning(hackPid) || ns.isRunning(weak1Pid) || ns.isRunning(growPid) || ns.isRunning(weak2Pid)) {
      await ns.sleep(1000);
    }
  }
}
