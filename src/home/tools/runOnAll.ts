import {NS} from '@ns';
import {execScriptOnHosts, getLinesFromFile} from '@/home/tools/utilities';
import {getRamOptionOrNumber, RamOptions} from '@/home/data/enums';
/**
 * @param {AutocompleteData} data - context about the game, useful when autocompleting
 * @param {string[]} args - current arguments, not including "run script.js"
 * @returns {string[]} - the array of possible autocomplete options
 */
// export function autocomplete(data: AutocompleteData, args: string[]): string[] {
//     // const serversWithArgsRemoved = data.servers.filtser(server => !args.includes(server));
//     // return [...serversWithArgsRemoved];
//
//
//     return ["argument0", "argument1", "argument2"];
// }

/*
 *
 *
 * */
export async function main(ns: NS) {
  const flags = ns.flags([
    ['h', ''],
    ['s', ''],
    ['a', ''],
    ['r', ''],
    ['help', false],
  ]);
  const hostFile = flags['h'] as string;
  const script = flags['s'] as string;
  const argsRaw = flags['a'] as string;
  const threads = flags['r'] as string;
  const help = flags['help'] as boolean;
  const args = parsePassThroughArgs(argsRaw);
  //exit if help is requested
  if (help) {
    printHelpDialog(ns);
  }

  //exit on required param missing
  if (!hostFile || !script || !threads) {
    printHelpDialog(ns);
  }
  const hosts: string[] = getLinesFromFile('/data/servers.txt', '\n', ns);
  ns.tprint(hosts);
  const threadsOrOption: RamOptions | number = getRamOptionOrNumber(threads);
  if (args) {
    ns.tprintf('%s %s %s %s', hostFile, script, threads, args);
    execScriptOnHosts(hosts, script, threadsOrOption, ns, args);
  }
  execScriptOnHosts(hosts, script, threadsOrOption, ns);
}

function parsePassThroughArgs(argsRaw: string): string[] {
  return argsRaw.split(';').map((arg) => {
    if (arg.length == 1) {
      return '-' + arg;
    }
    return arg;
  });
}

function printHelpDialog(ns: NS) {
  ns.tprint('Run a script on all servers');
  ns.tprint(
    'Usage: runOnAll.js ' +
      '-h {host} ' +
      '-s {script} ' +
      '-a {comma delimited string of args for script} ' +
      '-r {number of threads or RamOptions string}\n' +
      'host, script, and threads are required.',
  );
  ns.exit();
}
