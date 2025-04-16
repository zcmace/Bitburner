import {NS} from '@ns';

export async function main(ns: NS) {
    ns.ui.openTail();
    const infiltrations = ns.infiltration.getPossibleLocations()
        .map(location => ns.infiltration.getInfiltration(location.name))
        .sort((a, b) => b.difficulty - a.difficulty);

    for (const infiltration of infiltrations) {

        ns.printf('\n\nLocation: %s, %s \nDifficulty: %s\nSoARep: %s\n',
            infiltration.location.name
            , infiltration.location.city, infiltration.difficulty, infiltration.reward.SoARep)
    }

}