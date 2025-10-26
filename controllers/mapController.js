// controllers/mapController.js
const mapModel = require('../models/mapModel');
const locationVerificationService = require('../services/locationVerificationService');
const { isFeatureEnabled } = require('../utils/featureToggle');

const addJobLocation = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { address, latitude, longitude } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    let targetAddress = address;
    let lat = latitude;
    let lng = longitude;

    if (isFeatureEnabled('locationVerificationEnabled')) {
      const verification = await locationVerificationService.verifyAddress({ address, latitude, longitude });
      if (!verification.isValid) {
        return res.status(400).json({ success: false, message: verification.reason || 'Invalid location data' });
      }
      targetAddress = verification.formattedAddress;
      lat = verification.latitude;
      lng = verification.longitude;
    }

    if (lat == null || lng == null) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const location = await mapModel.addJobLocation(jobId, Number(lat), Number(lng), targetAddress);
    res.status(201).json({ success: true, location });
  } catch (err) {
    console.error('Error adding job location:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getJobLocation = async (req, res) => {
  try {
    const { jobId } = req.params;
    const location = await mapModel.getJobLocationById(jobId);
    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getJobsNearLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const jobs = await mapModel.getJobsNearLocation(Number(latitude), Number(longitude), Number(radius || 5));
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifyLocation = async (req, res) => {
  try {
    const verification = await locationVerificationService.verifyAddress(req.body);
    if (!verification.isValid) {
      return res.status(400).json({ success: false, message: verification.reason || 'Unable to verify location' });
    }
    res.json({ success: true, verification });
  } catch (err) {
    console.error('Error verifying location:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authMiddleware sets req.user
    const { latitude, longitude, address, city, country, postalCode } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const location = await mapModel.updateUserLocation(userId, Number(latitude), Number(longitude), address, city, country, postalCode);
    res.status(200).json({ success: true, location });
  } catch (err) {
    console.error('Error updating user location:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getNearbyUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { radius } = req.query; // radius in meters

    const nearbyUsers = await mapModel.getNearbyUsers(userId, Number(radius) || 5000);
    res.json({ success: true, nearbyUsers });
  } catch (err) {
    console.error('Error getting nearby users:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addJobLocation,
  getJobLocation,
  getJobsNearLocation,
  verifyLocation,
  updateUserLocation,
  getNearbyUsers
};
