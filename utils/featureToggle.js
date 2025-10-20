// utils/featureToggle.js
const path = require('path');

const features = require('../config/features.json');

const isFeatureEnabled = (featureKey) => {
  // First check environment variable
  const envKey = `FEATURE_${featureKey.toUpperCase()}`;
  if (process.env[envKey] !== undefined) {
    return process.env[envKey] === 'true';
  }
  
  // Then check features.json
  if (!(featureKey in features)) {
    console.warn(`[featureToggle] Feature "${featureKey}" not found in config. Defaulting to false.`);
    return false;
  }
  return Boolean(features[featureKey]);
};

const assertFeatureEnabled = (featureKey) => {
  if (!isFeatureEnabled(featureKey)) {
    const err = new Error(`Feature "${featureKey}" is currently disabled`);
    err.status = 403;
    throw err;
  }
};

module.exports = {
  isFeatureEnabled,
  assertFeatureEnabled,
};