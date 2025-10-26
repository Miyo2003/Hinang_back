// routes/mapRoutes.js
const express = require('express');
const router = express.Router();

const mapController = require('../controllers/mapController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/verify', authMiddleware, mapController.verifyLocation);
router.post('/job/:jobId', authMiddleware, mapController.addJobLocation);
router.get('/job/:jobId', authMiddleware, mapController.getJobLocation);
router.get('/nearby', authMiddleware, mapController.getJobsNearLocation);
router.post('/user/location', authMiddleware, mapController.updateUserLocation);
router.get('/nearby-users', authMiddleware, mapController.getNearbyUsers);

module.exports = router;
