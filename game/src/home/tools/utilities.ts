import {RamOptions, SERVER_KEYS} from '@/home/data/enums';
import {NS} from '@ns';

/*
 *This method executes the given script file on all hosts passed with the given args.
 * @param {string[]} hosts - Hosts to execute the script on.
 * @param {string} script - Script to execute on each host.
 * @param {string[]} args - List of arguments to pass to each execution.
 * @param {RamOptions} threadOrRamOption - This will decide how many threads to execute. RamOptions.ServerMax will execute the maximum number of threads possible
 * @param {NS} ns - ns pass function through
 *
 * */
export function execScriptOnHosts(
    hosts: string[],
    script: string,
    threadOrRamOption: RamOptions | number,
    ns: NS,
    args?: string[],
) {
    //check if file exists on current server
    if (!ns.fileExists(script)) {
        ns.tprintf('Script file does not exist on current host');
        ns.exit();
    }
    for (const host of hosts) {
        verifyFileAndExec(host, script, threadOrRamOption, ns, args);
    }
}

export function verifyFileAndExec(
    host: string,
    script: string,
    ramOptions: RamOptions | number,
    ns: NS,
    args?: string[],
): number {
    let writeSuccessful = false;
    ns.tprintf('File writing file %s on %s...', script, host);
    writeSuccessful = ns.scp(script, host);
    ns.tprintf('File %s%s written to %s.', script, writeSuccessful ? '' : ' not', host);

    if (writeSuccessful) {
        ns.tprintf('Attempting to execute %s on %s...', script, host);
        return executeScript(host, script, ramOptions, ns, args);
    } else {
        ns.tprintf('File %s does not exist on %s, and could not be written. skipping execution.', script, host);
        return 0;
    }
}

export function executeScript(
    host: string,
    script: string,
    ramOption: RamOptions | number,
    ns: NS,
    args?: string[],
): number {
    if (ramOption == RamOptions.ServerMax) {
        return execAtMaxThreads(host, script, ns, args);
    }
    return execAtNumberOfThreads(host, script, ramOption as number, ns, args);
}

export function execAtMaxThreads(host: string, script: string, ns: NS, args?: string[]): number {
    const maxThreads = getMaxThreadsForScriptOnHost(host, script, ns);
    if (maxThreads < 1) {
        ns.tprintf('Cannot run %s on %s. Host does not have required ram.', script, host);
        return 0;
    }
    if (!args) {
        return ns.exec(script, host, maxThreads);
    }
    return ns.exec(script, host, maxThreads, ...args);
}

export function execAtNumberOfThreads(host: string, script: string, threads: number, ns: NS, args?: string[]): number {
    const maxThreads = getMaxThreadsForScriptOnHost(host, script, ns);
    if (maxThreads < 1) {
        ns.tprintf('Cannot run %s on %s. Host does not have required ram.', script, host);
        return 0;
    }
    if (maxThreads < threads || threads == 0) {
        ns.tprintf(
            'Cannot run %s on %s with %s threads. Host max threads for this script: %s',
            script,
            host,
            threads,
            maxThreads,
        );
        return 0;
    }
    if (!args) {
        return ns.exec(script, host, threads);
    }
    return ns.exec(script, host, threads, ...args);
}

/**
 * This method returns the maximum number of threads this script can run on any given host.
 * Returns 0 if host has no available ram, or not enough to run script.
 *
 * @param {string} host - Host name to check ram.
 * @param {string} script - Script file to check max threads on host.
 * @param {NS} ns - NS pass through functions.
 * @returns {number} - Number of threads to max host available ram with given script.
 */
export function getMaxThreadsForScriptOnHost(host: string, script: string, ns: NS): number {
    const serverAvailableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
    const scriptRamForServer = ns.getScriptRam(script, host);
    if (serverAvailableRam == 0) {
        ns.tprintf('Host %s has no available ram - cannot run %s', host, script);
        return 0;
    }
    return Math.floor(serverAvailableRam / scriptRamForServer);
}

/* Returns file data as a string from specified host
 * @param {string} file - Full path to file.
 * @param {NS} ns - NS pass through
 * @param {string} host - Optional. Host to get file from. Defaults to current server.
 * @returns {string} - String data from file, if no file exists returns empty string.
 */
export function getFile(file: string, ns: NS, host?: string): string {
    //if false value passed for file return null
    if (!file) {
        ns.printf('No file passed to getFile');
        return '';
    }
    let fileExistOnHost: boolean;

    //check if file exists on local or remote server
    if (!host) {
        fileExistOnHost = ns.fileExists(file);
    } else {
        fileExistOnHost = ns.fileExists(file, host);
    }

    //file does not exist
    if (!fileExistOnHost) {
        ns.tprintf('File %s does not exist on %s', file, host);
        return '';
    }

    //read file data from local or remote host
    if (!host) {
        return ns.read(file);
    } else {
        const localHostName = ns.getHostname();
        const success = ns.scp(file, localHostName, host);
        if (!success) {
            ns.tprintf('Failed to copy file %s to %s', file, host);
            return '';
        }
        return ns.read(file);
    }
}

/* Returns file data as a string array from specified host with separator
 * @param {string} file - Full path to file.
 * @param {NS} ns - NS pass through
 * @param {string} host - Optional. Host to get file from. Defaults to current server.
 * @returns {string} - String data from, if no file exists returns empty string.
 */
export function getLinesFromFile(file: string, separator: string, ns: NS, host?: string): string[] {
    const fileData: string = getFile('/data/servers.txt', ns, host);
    if (!fileData) {
        ns.tprint('No file data found at %s', file);
        ns.exit();
    }
    return fileData.split(separator).map((line) => line.replace(/[\r\n]/g, '')) as string[];
}

/**
 * Writes an array of strings to a file on the current server, or copies the file to a target host if specified.
 *
 * @param {string} file - The name of the file to write data to.
 * @param {string[]} lines - An array of strings representing the lines to be written into the file.
 * @param {boolean} overwrite - WARNING: if true entire file will be overwritten, defaults to false.
 * @param {NS} ns - The NS interface object.
 *
 * @throws none Will log an error message using `ns.tprintf` if the file transfer fails when `host` is specified.
 */
export function writeLinesToFile(file: string, lines: string[], overwrite: boolean = false, ns: NS) {
    const fileData = lines.join('\n');
    ns.write(file, fileData, overwrite ? 'w' : 'a');
}

export function getServerCSVLine(server: any): string {
    const server_fields: string | any = [];
    for (let i = 0; i < SERVER_KEYS.length; i++) {
        server_fields[i] = (server[SERVER_KEYS[i]] ?? '') as string;
    }

    return server_fields.join(', ');
}

export function copyDirectory(target: string, directory: string, ns: NS) {
    const source = ns.getHostname();
    ns.scp(ns.ls(source, directory), target);
}

export function getAvailableRam(host: string, ns: NS) {
    const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
}

export interface TableData {
    [key: string]: any;
}

export function formatAsTable(data: TableData[] | any[][]): string {
    if (!Array.isArray(data) || data.length === 0) return '';

    // Helper function to get visual length of string (excluding ANSI escape sequences)
    const visualLength = (str: string): number => {
        // Remove all ANSI escape sequences for length calculation
        return str.replace(/\u001b\[\d+m/g, '').length;
    };

    // Helper function to pad a string to a visual length, respecting ANSI codes
    const padEndVisual = (str: string, length: number): string => {
        const visLen = visualLength(str);
        if (visLen >= length) return str;
        return str + ' '.repeat(length - visLen);
    };

    // Get all keys (including from nested objects)
    const keys: string[] = Array.isArray(data[0]) && !isObjectArray(data[0])
        ? [...new Array(data[0].length)].map((_, i) => i.toString())
        : [...new Set(data.flatMap(item => Object.keys(item)))];

    // Calculate column widths based on visual length
    const colWidths: Record<string, number> = {};
    keys.forEach(key => {
        colWidths[key] = key.length; // Headers don't have ANSI codes
        data.forEach(row => {
            const value = Array.isArray(row) && !isObjectArray(row)
                ? row[parseInt(key)]
                : (row as TableData)[key];
            const valueStr = String(value !== undefined ? value : '');
            colWidths[key] = Math.max(colWidths[key], visualLength(valueStr));
        });
    });

    // Create horizontal separator line
    const makeSeparator = (): string => {
        let line = '+';
        keys.forEach(key => {
            line += '-'.repeat(colWidths[key] + 2) + '+';
        });
        return line + '\n';
    };

    // Start building the result string
    let result = '';

    // Add top border
    result += makeSeparator();

    // Add header
    let headerRow = '|';
    keys.forEach(key => {
        headerRow += ' ' + key.padEnd(colWidths[key]) + ' |';
    });
    result += headerRow + '\n';

    // Add separator after header
    result += makeSeparator();

    // Add data rows
    data.forEach(row => {
        let dataRow = '|';
        keys.forEach(key => {
            const value = Array.isArray(row) && !isObjectArray(row)
                ? row[parseInt(key)]
                : (row as TableData)[key];
            const valueStr = String(value !== undefined ? value : '');
            // Use our custom padding function that accounts for ANSI codes
            dataRow += ' ' + padEndVisual(valueStr, colWidths[key]) + ' |';
        });
        result += dataRow + '\n';
    });

    // Add bottom border
    result += makeSeparator();

    return result;
}

// Helper function to check if an array contains objects
function isObjectArray(arr: any[]): boolean {
    return arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null && !Array.isArray(arr[0]);
}



