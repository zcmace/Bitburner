import { NS } from '@ns';

export async function main(ns: NS) {
  const flags = ns.flags([['h', '']]);
  const host = flags['h'] as string;

  ns.tprint(ns.getPurchasedServerCost(256));
}
