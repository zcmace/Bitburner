import { NS } from '@ns';

export async function main(ns: NS) {
  const host = ns.args[0] as string;
  const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
  ns.tprintf('Server: %s, Available RAM: %s', host, availableRam);
}
