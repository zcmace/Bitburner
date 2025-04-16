import {NS, Player, Server} from '@ns';
import {getAllServers} from "@/home/database/servers";

export async function main(ns: NS) {
    const servers = await getAllServers();
    const player = ns.getPlayer();

    const sorted = servers
        .filter(server => (server.moneyMax || 0) > 0)
        .filter(server => (server.requiredHackingSkill || 0) <= player.skills.hacking)
        .sort((a, b) => evaluateJuiciness(a, player, ns) - evaluateJuiciness(b, player, ns));

    ns.tprintf('Sorted by Juiciness:');
    sorted.forEach(server => ns.tprintf('%s: %s', server.hostname, evaluateJuiciness(server, player, ns)));
}

function evaluateJuiciness(server: Server, player: Player, ns: NS) {
    const maxMoney = server.moneyMax || 0;
    const growthRate = server.serverGrowth || 0;
    if (ns.fileExists('Formulas.exe', 'home')) {
        return (maxMoney * growthRate) / ns.formulas.hacking.growTime(server, player) / ns.formulas.hacking.hackTime(server, player);
    } else {
        return (maxMoney * growthRate);
    }
}