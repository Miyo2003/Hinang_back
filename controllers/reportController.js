const ReportModel = require('../models/reportModel');

// Create a new report
const createReport = async (req, res) => {
    try {
        const reporterId = req.user.id;
        const { reportedId, reason, description } = req.body;

        // Validation
        if (!reportedId || !reason) {
            return res.status(400).json({ 
                message: 'Reported ID and reason are required' 
            });
        }

        if (!ReportModel.validateReportReason(reason)) {
            return res.status(400).json({ 
                message: 'Invalid report reason' 
            });
        }

        const report = await ReportModel.createReport(
            reporterId, 
            reportedId, 
            { reason, description }
        );

        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Error creating report' });
    }
};

// Moderate a report
const moderateReport = async (req, res) => {
    try {
        // Check if user is admin in middleware
        const moderatorId = req.user.id;
        const { reportId } = req.params;
        const { status, notes } = req.body;

        // Validation
        if (!status) {
            return res.status(400).json({ 
                message: 'Moderation status is required' 
            });
        }

        const validStatuses = ['accepted', 'rejected', 'pending'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid moderation status' 
            });
        }

        const report = await ReportModel.moderateReport(
            reportId,
            moderatorId,
            { status, notes }
        );

        res.json(report);
    } catch (error) {
        console.error('Error moderating report:', error);
        res.status(500).json({ message: 'Error moderating report' });
    }
};

module.exports = {
    createReport,
    moderateReport
};