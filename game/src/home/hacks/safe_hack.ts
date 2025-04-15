import { NS } from '@ns';

export async function main(ns: NS) {
  //fetch args
  const flags = ns.flags([
    ['h', ''],
    ['m', 0.9],
    ['s', 1],
  ]);

  // Validate the host parameter
  if (!flags['h']) {
    ns.tprint("Error: Missing required parameter '-h' for host. Exiting.");
    return;
  }

  // const host = flags['h'] as string;
  const host = flags['h'] as string;
  const securityThreshold = flags['s'] as number;
  const hackThreshold = flags['m'] as number;

  ns.tprintf(
    'Executing with the following settings:\nServer: %s\nSecurity Threshold: %s\nHacking Threshold: %s',
    host,
    securityThreshold,
    hackThreshold,
  );

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const serverSecurityLevel = ns.getServerSecurityLevel(host);
    const minSecurityLevel = ns.getServerMinSecurityLevel(host);
    const serverMaxMoney = ns.getServerMaxMoney(host);
    const serverAvailableMoney = ns.getServerMoneyAvailable(host);
    const moneyPercent = serverAvailableMoney / serverMaxMoney;
    if (minSecurityLevel + securityThreshold < serverSecurityLevel) {
      await ns.weaken(host);
      continue;
    }
    if (moneyPercent < hackThreshold) {
      await ns.grow(host);
      continue;
    }
    await ns.hack(host);
  }
}
