import {NS} from '@ns';
import {formatAsTable} from "@/home/tools/utilities";

export async function main(ns: NS) {
    const data = [
        {name: 'John', age: 28, city: 'New York'},
        {name: 'Sarah', age: 32, city: 'London'},
        {name: 'Miguel', age: 25, city: 'Madrid'}
    ];

    const tableString = formatAsTable(data);
    ns.print(tableString);
    ns.ui.openTail();
}