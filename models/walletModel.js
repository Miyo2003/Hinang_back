const neo4j = require('../db/neo4j');
const fs = require('fs').promises;
const path = require('path');

class WalletModel {
    constructor() {
        this.createWalletQuery = fs.readFile(path.join(__dirname, '../queries/wallet/createWallet.cypher'), 'utf8');
        this.getWalletDetailsQuery = fs.readFile(path.join(__dirname, '../queries/wallet/getWalletDetails.cypher'), 'utf8');
    }

    async createWallet(userId, currency = 'USD') {
        const session = neo4j.session();
        try {
            const query = await this.createWalletQuery;
            const result = await session.run(query, { userId, currency });
            return result.records[0]?.get('w').properties || null;
        } finally {
            await session.close();
        }
    }

    async getWalletDetails(userId) {
        const session = neo4j.session();
        try {
            const query = await this.getWalletDetailsQuery;
            const result = await session.run(query, { userId });
            const record = result.records[0];
            if (!record) return null;

            return {
                balance: record.get('balance'),
                currency: record.get('currency'),
                transactions: record.get('transactions').map(t => t.properties)
            };
        } finally {
            await session.close();
        }
    }
}

module.exports = new WalletModel();