import { NS } from '@ns';

export async function main(ns: NS) {
  const hostName = ns.args[0] as string;
  const server = ns.getServer(hostName);
  const { ramUsed, maxRam, cpuCores, moneyAvailable, moneyMax } = server;

  const growRamUsage = 0.15;
  const weakenRamUsage = 0.15;
  const ramSafetyBuffer = 2.0;
  const multiToMax = (moneyMax as number) / (moneyAvailable as number);
  const threadsToMax = Math.ceil(ns.growthAnalyze(hostName, multiToMax));
  const securityIncrease = ns.growthAnalyzeSecurity(threadsToMax, hostName, cpuCores);
  const securityDecreasePerThread = ns.weakenAnalyze(1, cpuCores);
  const weakenThreadsNeeded = Math.ceil(securityIncrease / securityDecreasePerThread);
  const totalThreadsNeeded = threadsToMax + weakenThreadsNeeded;
  const weakenThreadsProportion = weakenThreadsNeeded / totalThreadsNeeded;
  const growThreadsProportion = threadsToMax / totalThreadsNeeded;
  const ramAvailable = maxRam - ramUsed - ramSafetyBuffer;
  const idealWeakenThreads = Math.ceil(weakenThreadsProportion * (ramAvailable / weakenRamUsage));
  const idealGrowThreads = Math.ceil(growThreadsProportion * (ramAvailable / growRamUsage));
  const growRamNeeded = idealGrowThreads * growRamUsage;
  const weakenRamNeeded = idealWeakenThreads * weakenRamUsage;
  const totalRamNeeded = growRamNeeded + weakenRamNeeded;

  ns.tprintf('Analyzing %s...', hostName);
  ns.tprintf('Number of Grow Threads to reach Max Money: %s', threadsToMax);
  ns.tprintf('Security increase for running %s threads of Grow: %s', threadsToMax, securityIncrease);
  ns.tprintf('Weaken threads needed to mitigate security increase: %s', weakenThreadsNeeded);
  ns.tprintf('Max Ram: %s, Ram Used: %s, Ram Safety Buffer: %s', maxRam, ramUsed, ramSafetyBuffer);
  ns.tprintf('Proportions | Weaken: %s | Grow: %s', weakenThreadsProportion, growThreadsProportion);
  ns.tprintf('Recommended Threads | Weaken: %s | Grow: %s', idealWeakenThreads, idealGrowThreads);
  ns.tprintf(
    'Total Ram needed for recommendation | Weaken: %s | Grow: %s | Total: %s',
    weakenRamNeeded,
    growRamNeeded,
    totalRamNeeded,
  );
  ns.tprintf('Server Info ------\n\n');

  ns.flags;

  for (const [key, value] of Object.entries(server)) {
    ns.tprintf('%s: %s', key, value);
  }

  ns.flags;
}

// const serverInfo = {
//     hostname: "n00dles",
//     ip: "25.6.2.3",
//     sshPortOpen: false,
//     ftpPortOpen: false,
//     smtpPortOpen: false,
//     httpPortOpen: false,
//     sqlPortOpen: false,
//     hasAdminRights: true,
//     cpuCores: 1,
//     isConnectedTo: false,
//     ramUsed: 0, "maxRam": 4,
//     organizationName: "Noodle Bar",
//     purchasedByPlayer: false,
//     backdoorInstalled: true,
//     baseDifficulty: 1,
//     hackDifficulty: 1.7700000000000007,
//     minDifficulty: 1,
//     moneyAvailable: 14343.130941167998,
//     moneyMax: 1750000,
//     numOpenPortsRequired: 0,
//     openPortCount: 0,
//     requiredHackingSkill: 1,
//     serverGrowth: 3000
// };
