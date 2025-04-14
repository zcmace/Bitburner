import { NS } from '@ns';

export async function main(ns: NS) {
  const flags = ns.flags([['s', '']]);
  while (true) {
    await ns.grow(flags['s'] as string);
  }
}
