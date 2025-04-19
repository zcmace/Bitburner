import {NS} from '@ns';

export async function main(ns: NS) {
    let ram, price;
    do {
        ram = await getRamOption(ns) as number;
        price = ns.getPurchasedServerCost(ram);
    } while (ns.getPlayer().money - price < 0);

    const formattedPrice = Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(price);
    const shouldBuy = await ns.prompt(`Would you like to buy a server with ${ns.formatRam(ram)} RAM for ${formattedPrice}`);
    if (shouldBuy) {
        const hostname = await ns.prompt('What would you like to name the server?', {type: "text"});
        ns.purchaseServer(hostname as string, ram);
    }
}

export async function getRamOption(ns: NS) {
    const powersOf2 = []
    const ramOptions: Map<string, number> = new Map();
    for (let i = 0; i < 20; i++) {
        const ramAmount: number = Math.pow(2, i + 1);
        ramOptions.set(ns.formatRam(ramAmount), ramAmount);
    }
    return ramOptions.get(await ns.prompt('What size server would you like?', {type: "select", choices: Array.from(ramOptions.keys())}) as string);
}


const ramOptions: Map<number, string> = new Map(

);