enum RamOptions {
  ServerMax = 'MAX',
  ScriptMin = 'MIN',
}

function iterateEnum(enumObj: any): [string, any][] {
  return Object.keys(enumObj).map((key) => [key, enumObj[key]]);
}

function getRamOptionOrNumber(str: string): RamOptions | number {
  for (const [, value] of iterateEnum(RamOptions)) {
    if (value === str) {
      return value;
    }
  }
  return Number(str);
}

let object = {};

const SERVER_KEYS = [
  'hostname',
  'ip',
  'sshPortOpen',
  'ftpPortOpen',
  'smtpPortOpen',
  'httpPortOpen',
  'sqlPortOpen',
  'hasAdminRights',
  'cpuCores',
  'isConnectedTo',
  'ramUsed',
  'maxRam',
  'organizationName',
  'purchasedByPlayer',
  'backdoorInstalled',
  'baseDifficulty',
  'hackDifficulty',
  'minDifficulty',
  'moneyAvailable',
  'moneyMax',
  'numOpenPortsRequired',
  'openPortCount',
  'requiredHackingSkill',
  'serverGrowth',
];

export { RamOptions, iterateEnum, getRamOptionOrNumber, SERVER_KEYS };
