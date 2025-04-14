import { NS } from '@ns';

export async function main(ns: NS) {
  const flags = ns.flags([
    ['target', ''],
    ['wait', 0],
  ]);

  const waitMs = flags['wait'] as number;
  const target = flags['target'] as string;

  if (!waitMs || !target) {
    ns.print('Missing required flags: wait, threads, target');
    ns.exit();
  }
  await ns.weaken(target);
}
