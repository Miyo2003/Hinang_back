const fs = require('fs').promises;
const path = require('path');
const { retry } = require('../utils/retryUtils');

class ProfileModel {
    constructor() {
        this.getProfileQuery = fs.readFile(path.join(__dirname, '../queries/profile/getProfile.cypher'), 'utf8');
        this.updateProfileQuery = fs.readFile(path.join(__dirname, '../queries/profile/updateProfile.cypher'), 'utf8');
    }
    async getProfile(userId) {
        const session = global.__neo4jDriver.session();
        try {
            const query = await this.getProfileQuery;
            const result = await retry(async () => await session.run(query, { userId }));
            const record = result.records[0];
            if (!record) return null;

            const profile = {
                user: record.get('u').properties,
                profile: record.get('p')?.properties || null,
                skills: record.get('skills').map(s => s.properties),
                workerProfile: record.get('w')?.properties || null,
                clientProfile: record.get('c')?.properties || null
            };

            return profile;
        } finally {
            await session.close();
        }
    }

    async updateProfile(userId, profileData) {
        const session = global.__neo4jDriver.session();
        try {
            const query = await this.updateProfileQuery;
            const result = await retry(async () => await session.run(query, {
                userId,
                profileData: {
                    ...profileData,
                    updatedAt: new Date().toISOString()
                }
            }));
            return result.records[0]?.get('p').properties || null;
        } finally {
            await session.close();
        }
    }
}

module.exports = new ProfileModel(); 