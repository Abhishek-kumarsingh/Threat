const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
const app = require('./app');
const { createServer } = require('http');
const { setupWebSocketServer } = require('./services/websocketService');
const logger = require('./utils/logger');

// Load env vars
dotenv.config();

// Connect to database
try {
    connectDB();
} catch (err) {
    logger.error('DB Connection Error:', err);
    process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server
setupWebSocketServer(server);

// Start server
server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});


// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});
