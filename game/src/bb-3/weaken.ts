import { NS } from '@ns';

export async function main(ns: NS) {
  const flags = ns.flags([
    ['target', ''],
    ['wait', 0],
  ]);
  const target = flags['target'] as string;
  const wait = flags['wait'] as number;
  if (!target) {
    ns.printf('No target specified');
    ns.exit();
  }
  await ns.weaken(target, { additionalMsec: wait });
}
