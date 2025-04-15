import {AutocompleteData, NS} from '@ns';

/**
 * @param {AutocompleteData} data - context about the game, useful when autocompleting
 * @param {string[]} args - current arguments, not including "run script.js"
 * @returns {string[]} - the array of possible autocomplete options
 */
export function autocomplete(data: AutocompleteData, args: string[]): number[] {
    const powersOf2 = []
    for (let i = 1; i < 24; i++) {
        powersOf2.push(Math.pow(2, i))
    }
    return powersOf2;
}

export async function main(ns: NS) {
    const ram = ns.args[0] as number;
    const price = ns.getPurchasedServerCost(ram);
    if (ns.getPlayer().money - price < 0) {
        ns.alert('Not enough money to buy server with ' + ram + ' RAM.');
        return;
    }

    const formattedPrice = Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(price);

    const shouldBuy = await ns.prompt('Would you like to buy a server with ' + ram + ' RAM for ' + formattedPrice);
    if (shouldBuy) {
        const hostname = await ns.prompt('What would you like to name the server?', {type: "text"});
        ns.purchaseServer(hostname as string, ram);
    }
}