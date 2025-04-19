import {NS, RunningScript} from '@ns';

export async function main(ns: NS) {
    ns.ui.openTail();
    const host = ns.args[0] as string;
    const script = 'hacks/hwgw.js'
    if (!host) {
        ns.tprint('No host specified');
        ns.exit();
    }
    const runningScript = ns.getRunningScript(script, host) as RunningScript;
    ns.print(runningScript);
    const moneyPerSec = runningScript.onlineMoneyMade / runningScript.onlineRunningTime;
    ns.print(ns.formatNumber(moneyPerSec));
    ns.print(ns.formatNumber(ns.getScriptIncome(script, host, '--target', 'aevum-police')));
    ns.formulas.mockServer()
}