import { NS } from '@ns';

interface Args {
  server: string;
  growThreads: number;
  weakenThreads: number;
  hackThreads: number;
}

export async function main(ns: NS) {
  const flags = ns.flags([
    ['s', 'string'],
    ['g', 0],
    ['w', 0],
    ['h', 0],
  ]);

  const { server, growThreads, weakenThreads, hackThreads } = {
    server: flags['s'] as string,
    growThreads: flags['g'] as number,
    weakenThreads: flags['w'] as number,
    hackThreads: flags['h'] as number,
  };

  executeScript('/loop/grow.ts', server, growThreads, ns);
  executeScript('/loop/weaken.ts', server, weakenThreads, ns);
  executeScript('/loop/hack.ts', server, hackThreads, ns);
}

function executeScript(script: string, server: string, threads: number, ns: NS) {
  if (threads < 1) {
    ns.printf('No %s threads started on %s', script, server);
    return;
  }
  if (!ns.fileExists(script, server)) {
    ns.scp(script, server);
  }
  ns.printf('Starting %s with %s threads on %s', script, threads, server);
  ns.exec(script, server, threads, '-s', server);
}
