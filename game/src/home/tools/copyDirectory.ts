import {NS} from '@ns';
import {copyDirectory} from "@/home/tools/utilities";

export async function main(ns: NS) {
    const directory = ns.args[0] as string;
    const target = ns.args[1] as string;
    copyDirectory(target, directory, ns);
}