import { NS } from '@ns';

export async function main(ns: NS) {
  const flags = ns.flags([['s', '']]);
  while (true) {
    await ns.weaken(flags['s'] as string);
  }
}
