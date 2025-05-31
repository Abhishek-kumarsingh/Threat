const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'openstreetmap', // hardcoded to avoid fallback issues
    formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
