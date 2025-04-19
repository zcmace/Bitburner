import {NS} from '@ns';

export async function main(ns: NS) {
    const purchasedServers: string[] = ns.getPurchasedServers().map((s) => {
        return s + ' | ' + ns.formatRam(ns.getServerMaxRam(s));
    })
    let hostname: string;
    hostname = (await ns.prompt('Which host would you like to upgrade?', {type: "select", choices: purchasedServers}) as string).split(' | ')[0];
    const currRam = ns.getServerMaxRam(hostname);
    let maxUpgradeOption = ns.getPurchasedServerMaxRam();
    if (maxUpgradeOption == currRam) {
        ns.alert('You cannot upgrade this server anymore. Exiting.');
        ns.exit();
    }
    const upgradeOptions = [];
    while (maxUpgradeOption != currRam * 2) {
        if (maxUpgradeOption < 1) {
            break;
        }
        const cost = ns.getPurchasedServerUpgradeCost(hostname, maxUpgradeOption);
        if (cost <= ns.getPlayer().money) {
            upgradeOptions.unshift(maxUpgradeOption + ' | ' + ns.formatNumber(cost, 3));
        }
        maxUpgradeOption /= 2;
    }
    const option: number = Number((await ns.prompt('Which host would you like to upgrade?', {type: "select", choices: upgradeOptions}) as string).split(' | ')[0]);
    ns.upgradePurchasedServer(hostname, option);

}