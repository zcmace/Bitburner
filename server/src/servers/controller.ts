import {Database} from 'sqlite';
import {Server} from '../../NetscriptDefinitions';

class ServerController {
    constructor(private db: Database) {
    }

    async createServer(server: Server): Promise<Server> {
        const {
            hostname,
            ip,
            sshPortOpen,
            ftpPortOpen,
            smtpPortOpen,
            httpPortOpen,
            sqlPortOpen,
            hasAdminRights,
            cpuCores,
            isConnectedTo,
            ramUsed,
            maxRam,
            organizationName,
            purchasedByPlayer,
            backdoorInstalled,
            baseDifficulty,
            hackDifficulty,
            minDifficulty,
            moneyAvailable,
            moneyMax,
            numOpenPortsRequired,
            openPortCount,
            requiredHackingSkill,
            serverGrowth,
        } = server;

        const sql = `
            INSERT INTO servers (hostname, ip, sshPortOpen, ftpPortOpen, smtpPortOpen, httpPortOpen, sqlPortOpen,
                                 hasAdminRights, cpuCores, isConnectedTo, ramUsed, maxRam, organizationName,
                                 purchasedByPlayer, backdoorInstalled, baseDifficulty, hackDifficulty,
                                 minDifficulty, moneyAvailable, moneyMax, numOpenPortsRequired, openPortCount,
                                 requiredHackingSkill, serverGrowth)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await this.db.run(sql, [
            hostname,
            ip,
            sshPortOpen,
            ftpPortOpen,
            smtpPortOpen,
            httpPortOpen,
            sqlPortOpen,
            hasAdminRights,
            cpuCores,
            isConnectedTo,
            ramUsed,
            maxRam,
            organizationName,
            purchasedByPlayer,
            backdoorInstalled,
            baseDifficulty,
            hackDifficulty,
            minDifficulty,
            moneyAvailable,
            moneyMax,
            numOpenPortsRequired,
            openPortCount,
            requiredHackingSkill,
            serverGrowth,
        ]);

        if (result.lastID) {
            // Get the server directly by hostname
            const createdServer = await this.getServer(hostname);
            return createdServer!;
        } else {
            throw new Error('Failed to create server');
        }
    }

    async getServer(hostname: string): Promise<Server | undefined> {
        const sql = 'SELECT * FROM servers WHERE hostname = ?';
        const row = await this.db.get(sql, [hostname]);
        return row as Server | undefined;
    }

    async getAllServers(): Promise<Server[]> {
        const sql = 'SELECT * FROM servers';
        const rows = await this.db.all(sql);
        return rows as Server[];
    }

    async updateServer(updatedServer: Server): Promise<Server | undefined> {
        const {
            hostname,
            ip,
            sshPortOpen,
            ftpPortOpen,
            smtpPortOpen,
            httpPortOpen,
            sqlPortOpen,
            hasAdminRights,
            cpuCores,
            isConnectedTo,
            ramUsed,
            maxRam,
            organizationName,
            purchasedByPlayer,
            backdoorInstalled,
            baseDifficulty,
            hackDifficulty,
            minDifficulty,
            moneyAvailable,
            moneyMax,
            numOpenPortsRequired,
            openPortCount,
            requiredHackingSkill,
            serverGrowth,
        } = updatedServer;

        const sql = `
            UPDATE servers
            SET hostname             = ?,
                ip                   = ?,
                sshPortOpen          = ?,
                ftpPortOpen          = ?,
                smtpPortOpen         = ?,
                httpPortOpen         = ?,
                sqlPortOpen          = ?,
                hasAdminRights       = ?,
                cpuCores             = ?,
                isConnectedTo        = ?,
                ramUsed              = ?,
                maxRam               = ?,
                organizationName     = ?,
                purchasedByPlayer    = ?,
                backdoorInstalled    = ?,
                baseDifficulty       = ?,
                hackDifficulty       = ?,
                minDifficulty        = ?,
                moneyAvailable       = ?,
                moneyMax             = ?,
                numOpenPortsRequired = ?,
                openPortCount        = ?,
                requiredHackingSkill = ?,
                serverGrowth         = ?
            WHERE hostname = ?
        `;

        const result = await this.db.run(sql, [
            hostname,
            ip,
            sshPortOpen,
            ftpPortOpen,
            smtpPortOpen,
            httpPortOpen,
            sqlPortOpen,
            hasAdminRights,
            cpuCores,
            isConnectedTo,
            ramUsed,
            maxRam,
            organizationName,
            purchasedByPlayer,
            backdoorInstalled,
            baseDifficulty,
            hackDifficulty,
            minDifficulty,
            moneyAvailable,
            moneyMax,
            numOpenPortsRequired,
            openPortCount,
            requiredHackingSkill,
            serverGrowth,
        ]);

        if (result && result.changes && result.changes >= 0) {
            return updatedServer;
        } else {
            throw new Error('Server not found or update failed');
        }
    }

    async deleteServer(hostname: string): Promise<void> {
        const sql = 'DELETE FROM servers WHERE hostname = ?';
        const result = await this.db.run(sql, [hostname]);
        if (result.changes === 0) {
            throw new Error('Server not found or deletion failed');
        }
    }

    async deleteAllServers(): Promise<void> {
        const sql = 'DELETE FROM servers';
        const result = await this.db.run(sql);
        if (result.changes === 0) {
            throw new Error('Server deletion failed');
        }
    }
}

export default ServerController;
