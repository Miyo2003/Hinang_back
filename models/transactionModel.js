const neo4j = require('../db/neo4j');
const fs = require('fs').promises;
const path = require('path');

class TransactionModel {
    constructor() {
        this.createTransactionQuery = fs.readFile(path.join(__dirname, '../queries/transaction/createTransaction.cypher'), 'utf8');
    }

    async createTransaction(fromWalletId, toWalletId, amount, type, description) {
        const session = neo4j.session();
        try {
            const query = await this.createTransactionQuery;
            const result = await session.run(query, {
                fromWalletId,
                toWalletId,
                amount,
                type,
                description
            });
            return result.records[0]?.get('t').properties || null;
        } catch (error) {
            if (error.message.includes('insufficient balance')) {
                throw new Error('Insufficient balance for transaction');
            }
            throw error;
        } finally {
            await session.close();
        }
    }
}

module.exports = new TransactionModel();