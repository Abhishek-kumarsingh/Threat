const dotenv = require('dotenv');
const path = require('path');

// Determine the path to the .env file
// This assumes config.env.js is in backend/config/ and .env is in backend/
const envPath = path.resolve(__dirname, '..', '.env');

// Load environment variables from config.env
const loadEnvResult = dotenv.config({ path: envPath });

if (loadEnvResult.error) {
    // In a real application, you might want to throw an error if essential .env variables are missing,
    // especially if not in production where they might be set directly in the environment.
    console.warn(`Warning: Could not load ${envPath}. Ensure it exists or environment variables are set directly.`);
    if (process.env.NODE_ENV === 'production') {
        // For production, if .env is critical and not found, you might want to throw
        // throw new Error(`FATAL: Could not load .env file at ${envPath}`);
    }
}

// Helper function to get an environment variable or throw an error if it's missing
const getEnv = (key, required = true, defaultValue = undefined) => {
    const value = process.env[key];
    if (required && (value === undefined || value === null || value === '')) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`FATAL ERROR: Environment variable ${key} is not defined.`);
    }
    return value === undefined && defaultValue !== undefined ? defaultValue : value;
};

// Helper for parsing integers
const getIntEnv = (key, required = true, defaultValue = undefined) => {
    const value = getEnv(key, required, defaultValue);
    if (value === undefined || value === null) return defaultValue; // if not required and not found, return default
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`FATAL ERROR: Environment variable ${key} is not a valid integer.`);
    }
    return parsed;
};

// Define and export the configuration object
const config = {
    nodeEnv: getEnv('NODE_ENV', true, 'development'),
    port: getIntEnv('PORT', true, 5001),

    mongo: {
        uri: getEnv('MONGO_URI', true),
    },

    jwt: {
        secret: getEnv('JWT_SECRET', true),
        expire: getEnv('JWT_EXPIRE', true, '30d'),
        cookieExpire: getIntEnv('JWT_COOKIE_EXPIRE', true, 30), // In days
    },

    email: {
        service: getEnv('EMAIL_SERVICE', false), // May not be used if email is disabled
        username: getEnv('EMAIL_USERNAME', false),
        password: getEnv('EMAIL_PASSWORD', false),
        fromName: getEnv('FROM_NAME', false, 'Threat Zone Monitoring System'),
        fromEmail: getEnv('FROM_EMAIL', false, 'noreply@example.com'),
    },

    twilio: {
        accountSid: getEnv('TWILIO_ACCOUNT_SID', false), // May not be used if SMS is disabled
        authToken: getEnv('TWILIO_AUTH_TOKEN', false),
        phoneNumber: getEnv('TWILIO_PHONE_NUMBER', false),
    },

    webPush: {
        vapidPublicKey: getEnv('VAPID_PUBLIC_KEY', false),
        vapidPrivateKey: getEnv('VAPID_PRIVATE_KEY', false),
        vapidSubject: getEnv('VAPID_SUBJECT', false, 'mailto:admin@example.com'),
    },

    geocoder: {
        provider: getEnv('GEOCODER_PROVIDER', false),
        apiKey: getEnv('GEOCODER_API_KEY', false),
    },

    maps: {
        apiKey: getEnv('MAPS_API_KEY', false),
    },

    predictionModelUrl: getEnv('PREDICTION_MODEL_URL', false, 'http://localhost:5000/predict'), // Example default
    clientUrl: getEnv('CLIENT_URL', true, 'http://localhost:3000'),
};

// Validate essential configurations (add more as needed)
if (!config.mongo.uri) {
    throw new Error('FATAL ERROR: MONGO_URI is not defined in the environment variables.');
}
if (!config.jwt.secret) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
}

module.exports = config;