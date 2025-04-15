import sqlite3 from 'sqlite3';
import {open} from 'sqlite';

export async function getDatabase() {
    // Open the database
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    // Create tables if they don't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS servers
        (
            hostname             TEXT UNIQUE NOT NULL PRIMARY KEY,
            ip                   TEXT,
            sshPortOpen          INTEGER,
            ftpPortOpen          INTEGER,
            smtpPortOpen         INTEGER,
            httpPortOpen         INTEGER,
            sqlPortOpen          INTEGER,
            hasAdminRights       INTEGER,
            cpuCores             INTEGER,
            isConnectedTo        TEXT,
            ramUsed              REAL,
            maxRam               REAL,
            organizationName     TEXT,
            purchasedByPlayer    INTEGER,
            backdoorInstalled    INTEGER,
            baseDifficulty       REAL,
            hackDifficulty       REAL,
            minDifficulty        REAL,
            moneyAvailable       REAL,
            moneyMax             REAL,
            numOpenPortsRequired INTEGER,
            openPortCount        INTEGER,
            requiredHackingSkill INTEGER,
            serverGrowth         INTEGER
        )
    `);

    return db;
}
