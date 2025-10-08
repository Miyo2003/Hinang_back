const neo4j = require('../db/neo4j');
const fs = require('fs').promises;
const path = require('path');

class ReportModel {
    constructor() {
        this.createReportQuery = fs.readFile(path.join(__dirname, '../queries/report/createReport.cypher'), 'utf8');
        this.moderateReportQuery = fs.readFile(path.join(__dirname, '../queries/moderation/moderateReport.cypher'), 'utf8');
    }

    async createReport(reporterId, reportedId, reportData) {
        const session = neo4j.session();
        try {
            const query = await this.createReportQuery;
            const result = await session.run(query, {
                reporterId,
                reportedId,
                reason: reportData.reason,
                description: reportData.description
            });
            return result.records[0]?.get('r').properties || null;
        } finally {
            await session.close();
        }
    }

    async moderateReport(reportId, moderatorId, moderationData) {
        const session = neo4j.session();
        try {
            const query = await this.moderateReportQuery;
            const result = await session.run(query, {
                reportId,
                moderatorId,
                status: moderationData.status,
                notes: moderationData.notes
            });
            return result.records[0]?.get('r').properties || null;
        } finally {
            await session.close();
        }
    }

    // Helper method to validate report reason
    validateReportReason(reason) {
        const validReasons = [
            'spam',
            'harassment',
            'inappropriate_content',
            'fake_account',
            'violence',
            'other'
        ];
        return validReasons.includes(reason);
    }
}

module.exports = new ReportModel();