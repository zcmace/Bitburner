import {NS} from '@ns';

export async function main(ns: NS) {
    const playerStocks: Stock[] = getStocks(ns).filter(s => s.longPosition.shares > 0 || s.shortPosition.shares > 0);
    while (true) {
        // ns.stock.getForecast()
        // ns.stock.getVolatility()
        const stocks: Stock[] = getStocks(ns);
        await ns.stock.nextUpdate();
    }
}

export function getStocks(ns: NS): Stock[] {
    return ns.stock.getSymbols().map(s => {
        const positions = ns.stock.getPosition(s);
        return {
            symbol: s,
            organization: ns.stock.getOrganization(s),
            price: ns.stock.getPrice(s),
            ask: ns.stock.getAskPrice(s),
            bid: ns.stock.getBidPrice(s),
            forecast: ns.stock.getForecast(s),
            maxShares: ns.stock.getMaxShares(s),
            volatility: ns.stock.getVolatility(s),
            longPosition: {
                shares: positions[0],
                avgPrice: positions[1]
            },
            shortPosition: {
                shares: positions[2],
                avgPrice: positions[3]
            }
        } as Stock;
    });
}

interface Stock {
    symbol: string;
    organization: string;
    price: number;
    ask: number;
    bid: number;
    forecast: number;
    maxShares: number;
    volatility: number;
    shortPosition: Position;
    longPosition: Position;
}

interface Position {
    shares: number;
    avgPrice: number;
}