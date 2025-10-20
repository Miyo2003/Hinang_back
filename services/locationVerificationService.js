// services/locationVerificationService.js
const fetch = require('node-fetch');

const verifyAddress = async ({ address, latitude, longitude }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
  }

  let url;
  if (latitude && longitude) {
    url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
  } else if (address) {
    url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  } else {
    return { isValid: false, reason: 'Address or coordinates are required for verification' };
  }

  const response = await fetch(url);
  if (!response.ok) {
    return { isValid: false, reason: `Geocoding API responded with status ${response.status}` };
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    return { isValid: false, reason: 'No matching location found for the provided details' };
  }

  const [result] = data.results;
  const { lat, lng } = result.geometry.location;

  return {
    isValid: true,
    formattedAddress: result.formatted_address,
    latitude: lat,
    longitude: lng,
    placeId: result.place_id,
    raw: result
  };
};

module.exports = {
  verifyAddress
};