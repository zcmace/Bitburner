import {NS} from '@ns';
import {formatAsTable, TableData} from "@/home/tools/utilities";

const green = "\u001b[32m";
const red = "\u001b[31m";
const reset = "\u001b[0m"

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
    saleValue: number;
    cost: number;
}

const portfolioAmount = 0;

const stopLossPercent = -0.25;
const stopGainPercent = 1;
const buyForecastPercent = 0.60;
const sellForecastPercent = 0.50;

export async function main(ns: NS) {
    ns.ui.openTail()
    const flags = ns.flags([
        ['portfolio-size', 3],
        ['max', false]
    ]);

    const runAtMax = flags['max'] as boolean;
    const portfolioSize = flags['portfolio-size'] as number;

    while (true) {
        await ns.stock.nextUpdate();
        topUpPortfolio(portfolioSize, runAtMax, ns);
        evaluateAndSellTrades(ns);
    }
}

export function topUpPortfolio(portfolioSize: number, buyMax: boolean, ns: NS) {
    const currentCash = ns.getPlayer().money;
    const stocks: Stock[] = getAllStocks(ns).sort((a: Stock, b: Stock) => b.forecast - a.forecast)
    let currentPortfolioSize = stocks.reduceRight((total, stock) => total + (stock.longPosition.shares > 0 ? 1 : 0), 0);
    const stocksAvailableToBuy = stocks
        .filter((s) => s.forecast >= buyForecastPercent);
    if (stocksAvailableToBuy.length === 0) {
        ns.print('No stocks meet buying criteria')
        return;
    }
    for (let i = 0; i < stocksAvailableToBuy.length; i++) {
        if (currentPortfolioSize >= portfolioSize && !buyMax) {
            break;
        }
        const stock = stocksAvailableToBuy[i];
        const sharesAvailable = stock.maxShares - stock.longPosition.shares;
        const purchaseCost = ns.stock.getPurchaseCost(stock.symbol, sharesAvailable, "L");
        if (purchaseCost <= currentCash) {
            const tradeSuccessful = buyStockShares(stock.symbol, sharesAvailable, ns);
            if (tradeSuccessful) {
                currentPortfolioSize++;
                continue;
            }
        }

        const askPrice = stock.ask;
        if (stock.ask > currentCash) {
            ns.print("Can't buy any stock, you broke.")
            return;
        }
        const sharesToBuy = sharesAvailable - Math.floor((currentCash - 100000) / stock.ask);
        if (sharesToBuy > 0) {
            const tradeSuccessful = buyStockShares(stock.symbol, sharesToBuy, ns);
            if (tradeSuccessful) {
                currentPortfolioSize++;
            }
        }
    }
}

function buyStockShares(symbol: string, shares: number, ns: NS): boolean {
    const purchaseAmount = ns.stock.buyStock(symbol, shares) * shares;
    if (purchaseAmount === 0) {
        ns.print(`Failed to buy ${shares} of ${symbol} for ${formatAmount(purchaseAmount, ns)}`)
        return false;
    }
    ns.print(`Bought ${shares} of ${symbol} for ${formatAmount(purchaseAmount, ns)}`);
    return true;
}

export function evaluateAndSellTrades(ns: NS) {
    const portfolio = getAllStocks(ns).filter((s) => s.longPosition.shares > 0);
    for (const stock of portfolio) {
        if (stock.longPosition.shares + stock.shortPosition.shares === 0) {
            //If we dont own position, skip stock
            continue;
        }
        const stockPL = stock.longPosition.saleValue - stock.longPosition.cost;
        const profitLossPercent = (stockPL / stock.longPosition.cost);
        if (profitLossPercent <= stopLossPercent) {
            //sell full trade
            sellAll(ns, stock, profitLossPercent);
            continue;
        }

        if (profitLossPercent >= stopGainPercent) {
            sellAll(ns, stock, profitLossPercent);
            continue;
        }

        //sell all if forecast goes below threshold %
        if (stock.forecast < sellForecastPercent) {
            const sale = (ns.stock.sellStock(stock.symbol, stock.longPosition.shares)) * stock.longPosition.shares;
            const message = `Sold ${stock.longPosition.shares} shares of ${stock.symbol} for ${formatAmount(sale, ns)} because the forecast fell to ${formatPercent(stock.forecast, sellForecastPercent, ns)}%`;
            ns.toast(message, "info", 5000);
            ns.print(message);
        }
    }
    printPortfolio(portfolio, ns);
}

export function printPortfolio(stocks: Stock[], ns: NS) {
    let totalPL = 0;
    let totalCost = 0;
    const tableData: TableData[] = stocks.map((s) => {
        const pl = s.longPosition.saleValue - s.longPosition.cost;
        const plPercent = pl / s.longPosition.cost;
        totalPL += pl;
        totalCost += s.longPosition.cost;
        return {
            "Symbol": s.symbol,
            "Forecast": formatPercent(s.forecast, sellForecastPercent + 0.05, ns),
            "Profit\\Loss": formatAmount(pl, ns),
            "Gain\\Loss": formatPercent(plPercent, 0, ns)
        }
    });
    ns.print(formatAsTable(tableData));
    ns.printf('Total P/L: %s (%s)', formatAmount(totalPL, ns), formatPercent(totalPL / totalCost, 0, ns));
    const lines = 6 + stocks.length;
    ns.ui.resizeTail(465, lines * 25);
    ns.ui.moveTail(1450, 0);
    ns.ui.renderTail();
}

export function formatPercent(number: number, threshold: number, ns: NS): string {
    // return ns.formatPercent(number);
    if (number < threshold) {
        return `${red}${ns.formatPercent(number)}${reset}`;
    }
    return `${green}${ns.formatPercent(number)}${reset}`;
}

export function formatAmount(number: number, ns: NS): string {
    // return ns.formatNumber(number);
    if (number < 0) {
        return `${red}${ns.formatNumber(number)}${reset}`;
    }
    return `${green}${ns.formatNumber(number)}${reset}`;
}

export function getAllStocks(ns: NS): Stock[] {
    return ns.stock.getSymbols().map(s => getStock(s, ns));
}


function sellAll(ns: NS, stock: Stock, profitLossPercent: number) {
    const sale = (ns.stock.sellStock(stock.symbol, stock.longPosition.shares)) * stock.longPosition.shares;
    const message = `Sold ${stock.longPosition.shares} shares of ${stock.symbol} for ${formatAmount(sale, ns)} because profit was ${formatPercent(profitLossPercent, 0, ns)}%`;
    ns.toast(message, "info", 5000);
    ns.print(message);
    console.table()
}

export function getStock(symbol: string, ns: NS): Stock {
    const positions = ns.stock.getPosition(symbol);
    return {
        symbol: symbol,
        organization: ns.stock.getOrganization(symbol),
        price: ns.stock.getPrice(symbol),
        ask: ns.stock.getAskPrice(symbol),
        bid: ns.stock.getBidPrice(symbol),
        forecast: ns.stock.getForecast(symbol),
        maxShares: ns.stock.getMaxShares(symbol),
        volatility: ns.stock.getVolatility(symbol),
        longPosition: {
            shares: positions[0],
            avgPrice: positions[1],
            saleValue: ns.stock.getSaleGain(symbol, positions[0], "L"),
            cost: positions[0] * positions[1]
        } as Position,
        shortPosition: {
            shares: positions[2],
            avgPrice: positions[3],
            saleValue: ns.stock.getSaleGain(symbol, positions[2], "S"),
            cost: positions[2] * positions[3]
        } as Position,
    } as Stock;
}


