const express = require('express');
const cors = require('cors');
const colors = require('colors');

const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Body parser middleware
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend server is running!',
        timestamp: new Date().toISOString()
    });
});

// Auth test route
app.get('/api/auth/me', (req, res) => {
    res.json({
        success: true,
        data: {
            id: 'test-user',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
        }
    });
});

// Sensors test route
app.get('/api/sensors', (req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: '1',
                name: 'Temperature Sensor 1',
                type: 'temperature',
                status: 'online',
                location: { lat: 40.7128, lng: -74.0060 },
                lastReading: { value: 22.5, timestamp: new Date() }
            },
            {
                id: '2',
                name: 'Air Quality Monitor',
                type: 'air_quality',
                status: 'online',
                location: { lat: 40.7589, lng: -73.9851 },
                lastReading: { value: 45, timestamp: new Date() }
            }
        ]
    });
});

// Alerts test route
app.get('/api/alerts', (req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: '1',
                title: 'High Temperature Alert',
                severity: 'high',
                status: 'active',
                message: 'Temperature sensor reading above threshold',
                timestamp: new Date(),
                sensorId: '1'
            }
        ]
    });
});

// Dashboard test route
app.get('/api/dashboard', (req, res) => {
    res.json({
        success: true,
        data: {
            totalSensors: 5,
            activeSensors: 4,
            totalAlerts: 3,
            activeAlerts: 1,
            threatZones: 2,
            systemStatus: 'operational',
            lastUpdate: new Date()
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`.yellow.bold);
    console.log(`Test endpoint: http://localhost:${PORT}/api/test`.cyan);
});
