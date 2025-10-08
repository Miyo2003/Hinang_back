const neo4j = require('../db/neo4j');
const fs = require('fs').promises;
const path = require('path');

class ServiceModel {
    constructor() {
        this.createServiceQuery = fs.readFile(path.join(__dirname, '../queries/services/createService.cypher'), 'utf8');
        this.getUserServicesQuery = fs.readFile(path.join(__dirname, '../queries/services/getUserServices.cypher'), 'utf8');
    }

    async createService(userId, serviceData) {
        const session = neo4j.session();
        try {
            const query = await this.createServiceQuery;
            const result = await session.run(query, {
                userId,
                title: serviceData.title,
                description: serviceData.description,
                price: serviceData.price,
                category: serviceData.category
            });
            return result.records[0]?.get('s').properties || null;
        } finally {
            await session.close();
        }
    }

    async getUserServices(userId) {
        const session = neo4j.session();
        try {
            const query = await this.getUserServicesQuery;
            const result = await session.run(query, { userId });
            return result.records.map(record => record.get('s').properties);
        } finally {
            await session.close();
        }
    }
}

module.exports = new ServiceModel();