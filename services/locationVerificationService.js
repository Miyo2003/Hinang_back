// services/locationVerificationService.js
const fetch = require('node-fetch');
const config = require('../config');

const verifyAddress = async ({ address, latitude, longitude }) => {
  const apiKey = config.maps.geoapifyApiKey;
  if (!apiKey) {
    throw new Error('GEOAPIFY_API_KEY environment variable is not set');
  }

  let url;
  if (latitude && longitude) {
    // Use Geoapify reverse geocoding
    url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`;
  } else if (address) {
    // Use Geoapify geocoding
    url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`;
  } else {
    return { isValid: false, reason: 'Address or coordinates are required for verification' };
  }

  const response = await fetch(url);
  if (!response.ok) {
    return { isValid: false, reason: `Geoapify API responded with status ${response.status}` };
  }

  const data = await response.json();
  if (!data.features || data.features.length === 0) {
    return { isValid: false, reason: 'No matching location found for the provided details' };
  }

  const feature = data.features[0];
  const [lng, lat] = feature.geometry.coordinates;
  const properties = feature.properties;

  return {
    isValid: true,
    formattedAddress: properties.formatted,
    latitude: lat,
    longitude: lng,
    placeId: properties.place_id,
    raw: feature
  };
};

module.exports = {
  verifyAddress
};
