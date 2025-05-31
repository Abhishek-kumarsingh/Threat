const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');

let wss = null;
const clients = new Map();

/**
 * Setup WebSocket server
 * @param {Object} server - HTTP server instance
 */
exports.setupWebSocketServer = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws, req) => {
        try {
            // Extract token from query parameters
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get('token');

            if (!token) {
                ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
                ws.close();
                return;
            }

            // Verify token
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
                ws.close();
                return;
            }

            // Get user from database to ensure they exist and get latest data
            const user = await User.findById(decoded.id);
            if (!user) {
                ws.send(JSON.stringify({ type: 'error', message: 'User not found' }));
                ws.close();
                return;
            }

            // Store client info
            const clientInfo = {
                userId: user._id.toString(),
                name: user.name,
                role: user.role,
                ws
            };

            // Add to clients map
            clients.set(ws, clientInfo);
            logger.info(`WebSocket client connected: ${user.name} (${user._id})`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connection',
                message: 'Connected to Threat Zone Monitoring System',
                user: {
                    id: user._id,
                    name: user.name,
                    role: user.role
                }
            }));

            // Handle incoming messages
            ws.on('message', (message) => {
                handleMessage(ws, message);
            });

            // Handle disconnection
            ws.on('close', () => {
                clients.delete(ws);
                logger.info(`WebSocket client disconnected: ${user.name} (${user._id})`);
            });
        } catch (err) {
            logger.error(`Error in WebSocket connection: ${err.message}`);
            ws.send(JSON.stringify({ type: 'error', message: 'Server error' }));
            ws.close();
        }
    });

    logger.info('WebSocket server initialized');
};

/**
 * Handle incoming WebSocket messages
 * @param {Object} ws - WebSocket connection
 * @param {string} message - Incoming message
 */
const handleMessage = (ws, message) => {
    try {
        logger.info(`Received WebSocket message: ${message}`);
        const data = JSON.parse(message);
        const clientInfo = clients.get(ws);

        if (!clientInfo) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
            return;
        }

        // Handle different message types
        switch (data.type) {
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                break;

            case 'subscribe':
                // Extract topic from the message data
                const subscribeTopic = data.topic || (typeof data === 'string' ? data : null);
                if (subscribeTopic) {
                    handleSubscription(ws, clientInfo, { topic: subscribeTopic });
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Topic is required for subscription' }));
                }
                break;

            case 'unsubscribe':
                // Extract topic from the message data
                const unsubscribeTopic = data.topic || (typeof data === 'string' ? data : null);
                if (unsubscribeTopic) {
                    handleUnsubscription(ws, clientInfo, { topic: unsubscribeTopic });
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Topic is required for unsubscription' }));
                }
                break;

            default:
                logger.info(`Received unknown message type: ${data.type}`);
                ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
    } catch (err) {
        logger.error(`Error handling WebSocket message: ${err.message}`);
        ws.send(JSON.stringify({ type: 'error', message: 'Error processing message' }));
    }
};

/**
 * Handle subscription requests
 * @param {Object} ws - WebSocket connection
 * @param {Object} clientInfo - Client information
 * @param {Object} data - Subscription data
 */
const handleSubscription = (ws, clientInfo, data) => {
    if (!data.topic) {
        ws.send(JSON.stringify({ type: 'error', message: 'Topic is required for subscription' }));
        return;
    }

    // Store subscription in client info
    if (!clientInfo.subscriptions) {
        clientInfo.subscriptions = new Set();
    }

    clientInfo.subscriptions.add(data.topic);

    ws.send(JSON.stringify({
        type: 'subscribed',
        topic: data.topic,
        message: `Subscribed to ${data.topic}`
    }));

    logger.info(`Client ${clientInfo.userId} subscribed to ${data.topic}`);
};

/**
 * Handle unsubscription requests
 * @param {Object} ws - WebSocket connection
 * @param {Object} clientInfo - Client information
 * @param {Object} data - Unsubscription data
 */
const handleUnsubscription = (ws, clientInfo, data) => {
    if (!data.topic) {
        ws.send(JSON.stringify({ type: 'error', message: 'Topic is required for unsubscription' }));
        return;
    }

    if (clientInfo.subscriptions) {
        clientInfo.subscriptions.delete(data.topic);
    }

    ws.send(JSON.stringify({
        type: 'unsubscribed',
        topic: data.topic,
        message: `Unsubscribed from ${data.topic}`
    }));

    logger.info(`Client ${clientInfo.userId} unsubscribed from ${data.topic}`);
};

/**
 * Broadcast alert to all connected clients
 * @param {Object} alert - Alert document
 */
exports.broadcastAlert = (alert) => {
    if (!wss) {
        logger.warn('WebSocket server not initialized');
        return;
    }

    const message = {
        type: 'alert',
        timestamp: Date.now(),
        alert: {
            id: alert._id,
            title: alert.title,
            message: alert.message,
            severity: alert.severity,
            location: alert.location,
            status: alert.status,
            createdAt: alert.createdAt
        }
    };

    broadcastToRelevantClients(message, alert.location);
};

/**
 * Broadcast threat zone update to all connected clients
 * @param {Object} threatZone - Threat zone document
 */
exports.broadcastThreatZone = (threatZone) => {
    if (!wss) {
        logger.warn('WebSocket server not initialized');
        return;
    }

    const message = {
        type: 'threatZone',
        timestamp: Date.now(),
        threatZone: {
            id: threatZone._id,
            location: threatZone.location,
            predictionLevel: threatZone.prediction.level,
            isActive: threatZone.isActive,
            timestamp: threatZone.timestamp
        }
    };

    broadcastToRelevantClients(message, threatZone.location);
};

/**
 * Broadcast sensor reading update to relevant clients
 * @param {Object} sensorReading - Sensor reading document
 */
exports.broadcastSensorReading = (sensorReading) => {
    if (!wss) {
        logger.warn('WebSocket server not initialized');
        return;
    }

    const message = {
        type: 'sensorReading',
        timestamp: Date.now(),
        sensorReading: {
            id: sensorReading._id,
            sensor: sensorReading.sensor,
            readings: sensorReading.readings,
            status: sensorReading.status,
            timestamp: sensorReading.timestamp
        }
    };

    // We need to find the location of this sensor
    mongoose.model('Sensor').findById(sensorReading.sensor)
        .then(sensor => {
            if (sensor && sensor.location) {
                broadcastToRelevantClients(message, sensor.location);
            } else {
                // If sensor location is unknown, broadcast to all clients
                broadcastToAllClients(message);
            }
        })
        .catch(err => {
            logger.error(`Error finding sensor location: ${err.message}`);
            // Fallback to broadcasting to all clients
            broadcastToAllClients(message);
        });
};

/**
 * Broadcast message to all clients
 * @param {Object} message - Message to broadcast
 */
const broadcastToAllClients = (message) => {
    const messageStr = JSON.stringify(message);

    clients.forEach((clientInfo, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
        }
    });
};

/**
 * Broadcast message to clients that should receive updates for a specific location
 * @param {Object} message - Message to broadcast
 * @param {string} locationId - Location ID
 */
const broadcastToRelevantClients = (message, locationId) => {
    const messageStr = JSON.stringify(message);
    const locationStr = locationId.toString();

    // Find all relevant users (admins, supervisors, and users assigned to this location)
    User.find({
        $or: [
            { assignedLocations: locationId },
            { role: { $in: ['admin', 'supervisor'] } }
        ]
    })
        .then(users => {
            const relevantUserIds = new Set(users.map(u => u._id.toString()));

            // Send to all relevant clients
            clients.forEach((clientInfo, ws) => {
                if (
                    ws.readyState === WebSocket.OPEN &&
                    (
                        relevantUserIds.has(clientInfo.userId) ||
                        clientInfo.role === 'admin' ||
                        clientInfo.role === 'supervisor'
                    )
                ) {
                    ws.send(messageStr);
                }
            });
        })
        .catch(err => {
            logger.error(`Error finding users for location: ${err.message}`);
            // Fallback to broadcasting to all clients
            broadcastToAllClients(message);
        });
};
