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

const autocompleteAddress = async (query) => {
  const apiKey = config.maps.geoapifyApiKey;
  if (!apiKey) {
    throw new Error('GEOAPIFY_API_KEY environment variable is not set');
  }

  if (!query || query.length < 1) {
    return [];
  }

  // Use Geoapify autocomplete endpoint with filters for Bongao, Tawi-Tawi, Philippines
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:PH&bias=proximity:5.029,119.773&apiKey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geoapify API responded with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.features) {
    return [];
  }

  // Filter results to only include Bongao addresses
  const bongaoSuggestions = data.features.filter(feature => {
    const properties = feature.properties;
    return properties.city === 'Bongao' || properties.state === 'Tawi-Tawi';
  });

  // Format suggestions with street, barangay, municipality, province
  return bongaoSuggestions.map(feature => {
    const properties = feature.properties;
    const [lng, lat] = feature.geometry.coordinates;

    // Build formatted address components
    const addressParts = [];
    if (properties.street) addressParts.push(properties.street);
    if (properties.suburb || properties.neighbourhood) addressParts.push(properties.suburb || properties.neighbourhood);
    if (properties.city) addressParts.push(properties.city);
    if (properties.state) addressParts.push(properties.state);

    const formattedAddress = addressParts.join(', ');

    return {
      id: properties.place_id,
      text: formattedAddress,
      formattedAddress: formattedAddress,
      latitude: lat,
      longitude: lng,
      properties: properties
    };
  });
};

module.exports = {
  verifyAddress,
  autocompleteAddress
};
