# Frontend-Backend API Synchronization Guide

## 🔄 API Configuration

### Backend Server
- **URL**: `http://localhost:5000`
- **API Base**: `http://localhost:5000/api`
- **WebSocket**: `http://localhost:5000`

### Frontend Configuration
- **Frontend URL**: `http://localhost:3000`
- **API Proxy**: Points to backend server
- **Environment**: `.env.local` configured for backend connection

## 📡 API Endpoint Mapping

### Authentication Endpoints
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration
- **GET** `/api/auth/logout` - User logout
- **GET** `/api/auth/refresh-token` - Refresh JWT token
- **GET** `/api/auth/me` - Get current user profile
- **PUT** `/api/auth/updatedetails` - Update user profile
- **PUT** `/api/auth/updatepassword` - Change password
- **PUT** `/api/auth/preferences` - Update user preferences
- **POST** `/api/auth/webpush` - Store web push subscription
- **POST** `/api/auth/forgotpassword` - Request password reset
- **PUT** `/api/auth/resetpassword/:token` - Reset password with token

### Sensor Endpoints
- **GET** `/api/sensors` - Get all sensors with pagination
- **GET** `/api/sensors/:id` - Get specific sensor details
- **POST** `/api/sensors` - Create new sensor (admin/supervisor)
- **PUT** `/api/sensors/:id` - Update sensor (admin/supervisor)
- **DELETE** `/api/sensors/:id` - Delete sensor (admin)
- **GET** `/api/sensors/status` - Get sensor status overview
- **GET** `/api/sensors/maintenance-due` - Get sensors needing maintenance
- **GET** `/api/sensors/:id/readings` - Get sensor readings with filters
- **POST** `/api/sensors/:id/readings` - Submit new sensor reading
- **GET** `/api/sensors/:id/thresholds` - Get sensor thresholds
- **PUT** `/api/sensors/:id/thresholds` - Update sensor thresholds

### Alert Endpoints
- **GET** `/api/alerts` - Get all alerts with pagination
- **GET** `/api/alerts/:id` - Get specific alert details
- **POST** `/api/alerts` - Create new alert (admin/supervisor)
- **PUT** `/api/alerts/:id` - Update alert (admin/supervisor)
- **DELETE** `/api/alerts/:id` - Delete alert (admin)
- **GET** `/api/alerts/active` - Get active alerts
- **PUT** `/api/alerts/:id/acknowledge` - Acknowledge alert
- **PUT** `/api/alerts/:id/resolve` - Resolve alert
- **POST** `/api/alerts/test` - Send test alert (admin/supervisor)

### Threat Zone Endpoints
- **GET** `/api/threat-zones` - Get all threat zones
- **GET** `/api/threat-zones/:id` - Get specific threat zone
- **POST** `/api/threat-zones` - Create threat zone (admin/supervisor)
- **PUT** `/api/threat-zones/:id` - Update threat zone (admin/supervisor)
- **DELETE** `/api/threat-zones/:id` - Delete threat zone (admin)
- **PUT** `/api/threat-zones/:id/deactivate` - Deactivate threat zone
- **GET** `/api/threat-zones/active` - Get active threat zones
- **GET** `/api/threat-zones/locations/:locationId/active` - Get location threat zones
- **POST** `/api/threat-zones/predict` - Generate threat prediction
- **GET** `/api/threat-zones/locations/:locationId/history` - Get location history
- **POST** `/api/threat-zones/predict-all` - Run all predictions (admin)

### Admin Endpoints
- **GET** `/api/admin/dashboard` - Admin dashboard summary
- **GET** `/api/admin/user-stats` - User statistics
- **GET** `/api/admin/recent-activity` - Recent system activity
- **GET** `/api/admin/system-health` - System health status
- **POST** `/api/admin/maintenance` - Run maintenance tasks
- **GET** `/api/admin/audit-logs` - Get audit logs
- **POST** `/api/admin/backup` - Create system backup

### User Management Endpoints
- **GET** `/api/users` - Get all users (admin)
- **GET** `/api/users/:id` - Get specific user (admin)
- **POST** `/api/users` - Create new user (admin)
- **PUT** `/api/users/:id` - Update user (admin)
- **DELETE** `/api/users/:id` - Delete user (admin)
- **GET** `/api/users/:id/notifications` - Get user notifications
- **POST** `/api/users/:id/locations` - Assign locations to user
- **GET** `/api/users/:id/locations` - Get user locations
- **PUT** `/api/users/:id/preferences` - Update user preferences

### Dashboard Endpoints
- **GET** `/api/dashboard` - Main dashboard summary
- **GET** `/api/dashboard/user` - User-specific dashboard
- **GET** `/api/dashboard/activity` - Recent activity
- **GET** `/api/dashboard/locations/:id` - Location overview

### Notification Endpoints
- **GET** `/api/notifications` - Get user notifications
- **GET** `/api/notifications/:id` - Get specific notification
- **PUT** `/api/notifications/:id/read` - Mark notification as read
- **PUT** `/api/notifications/read-all` - Mark all notifications as read
- **DELETE** `/api/notifications/:id` - Delete notification
- **DELETE** `/api/notifications/read` - Delete read notifications

## 🔧 Frontend Service Layer

### Service Files Updated
- `src/services/api.js` - Base API configuration
- `src/services/authService.js` - Authentication methods
- `src/services/sensorService.js` - Sensor management
- `src/services/alertService.js` - Alert management
- `src/services/threatZoneService.js` - Threat zone management
- `src/services/notificationService.js` - Notification management
- `src/services/adminService.js` - Admin operations (NEW)
- `src/services/dashboardService.js` - Dashboard data (NEW)
- `src/services/socketService.js` - WebSocket connection

### Context Providers
- `contexts/auth-context.tsx` - Authentication state
- `contexts/alert-context.tsx` - Alert management state
- `contexts/notification-context.tsx` - Notification state
- `contexts/sensor-context.tsx` - Sensor state
- `contexts/websocket-context.tsx` - WebSocket connection state

## 🚀 Development Setup

### Quick Start Commands
```bash
# Start both frontend and backend
npm run dev:full

# Start only frontend (port 3000)
npm run dev:frontend

# Start only backend (port 5000)
npm run dev:backend
```

### Environment Configuration
- Frontend: `.env.local` points to `http://localhost:5000/api`
- Backend: Runs on port 5000 with MongoDB connection
- WebSocket: Integrated with backend server

## 📊 WebSocket Events

### Real-time Events
- `sensor_reading` - New sensor data
- `alert_created` - New alert generated
- `alert_updated` - Alert status changed
- `threat_zone_created` - New threat zone
- `threat_zone_updated` - Threat zone updated
- `system_notification` - System-wide notifications
- `user_notification` - User-specific notifications

## 🔐 Authentication Flow

1. User logs in via frontend
2. Backend validates credentials
3. JWT token returned and stored
4. Token included in all API requests
5. WebSocket connection authenticated with token
6. Real-time updates received via WebSocket

## 📱 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🛠️ Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend CORS is configured for frontend URL
2. **Connection Refused**: Check if backend server is running on port 5000
3. **WebSocket Issues**: Verify WebSocket URL in environment variables
4. **Auth Errors**: Check JWT token validity and refresh mechanism

### Debug Commands
```bash
# Check backend status
curl http://localhost:5000/api/auth/me

# Check frontend API connection
curl http://localhost:3000/api/backend/auth/me

# View backend logs
cd backend && npm run dev

# View frontend logs
npm run dev:frontend
```

### UserManagement.jsx
- **GET** `/api/users` - List all users
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

### SensorManagement.jsx
- **GET** `/api/sensors` - List all sensors
- **POST** `/api/sensors` - Create new sensor
- **PUT** `/api/sensors/:id` - Update sensor
- **DELETE** `/api/sensors/:id` - Delete sensor
- **PUT** `/api/sensors/:id/thresholds` - Update sensor thresholds

### LocationManagement.jsx
- **GET** `/api/locations` - List all locations
- **POST** `/api/locations` - Create new location
- **PUT** `/api/locations/:id` - Update location
- **DELETE** `/api/locations/:id` - Delete location
- **GET** `/api/locations/:id/sensors` - Get sensors for location

### SystemSettings.jsx
- **GET** `/api/admin/system-health` - System health status
- **POST** `/api/admin/maintenance` - Trigger maintenance
- **POST** `/api/admin/backup` - Create backup

### ModelConfiguration.jsx
- **POST** `/api/threat-zones/predict` - Test prediction model
- **POST** `/api/threat-zones/predict-all` - Run all predictions

## User Components

### UserDashboard.jsx
- **GET** `/api/dashboard/user` - User-specific dashboard data

### Profile.jsx
- **GET** `/api/auth/me` - Get current user profile
- **PUT** `/api/auth/updatedetails` - Update profile
- **PUT** `/api/auth/updatepassword` - Change password

### NotificationSettings.jsx
- **GET** `/api/auth/me` - Get current preferences
- **PUT** `/api/auth/preferences` - Update notification preferences

## Sensor Components

### SensorList.jsx
- **GET** `/api/sensors` - List all sensors with filtering/sorting

### SensorDetail.jsx
- **GET** `/api/sensors/:id` - Get sensor details
- **GET** `/api/sensors/:id/readings` - Get sensor readings
- **PUT** `/api/sensors/:id/thresholds` - Update thresholds

### SensorMap.jsx
- **GET** `/api/sensors` - Get all sensors for map display
- **GET** `/api/locations` - Get location data for map

### SensorChart.jsx
- **GET** `/api/sensors/:id/readings` - Get historical readings for charts

### SensorStatus.jsx
- **GET** `/api/sensors/status` - Get sensor status overview

## Alert Components

### AlertList.jsx
- **GET** `/api/alerts` - List alerts with filtering
- **GET** `/api/alerts/active` - Get active alerts only

### AlertDetail.jsx
- **GET** `/api/alerts/:id` - Get alert details
- **PUT** `/api/alerts/:id/acknowledge` - Acknowledge alert
- **PUT** `/api/alerts/:id/resolve` - Resolve alert

### CreateAlert.jsx
- **POST** `/api/alerts` - Create new alert
- **GET** `/api/locations` - Get locations for dropdown

### AlertHistory.jsx
- **GET** `/api/alerts` - Get historical alerts with filters

### AlertSettings.jsx
- **GET/PUT** - Various alert configuration endpoints

## Threat Zone Components

### ThreatMap.jsx
- **GET** `/api/threat-zones/active` - Get active threat zones
- **GET** `/api/threat-zones/locations/:locationId/active` - Location-specific zones

### ZoneDetails.jsx
- **GET** `/api/threat-zones/:id` - Get threat zone details

### EvacuationRoutes.jsx
- **GET** `/api/threat-zones/:id` - Get evacuation route data

### PredictionSettings.jsx
- **POST** `/api/threat-zones/predict` - Run predictions with custom parameters

## Notification Components

### NotificationContext.jsx
- **GET** `/api/notifications` - Get user notifications
- **PUT** `/api/notifications/:id/read` - Mark as read
- **PUT** `/api/notifications/read-all` - Mark all as read
- **DELETE** `/api/notifications/:id` - Delete notification

## Service Layer Mapping

### authService.js
- **POST** `/api/auth/login`
- **POST** `/api/auth/register`
- **GET** `/api/auth/logout`
- **GET** `/api/auth/me`
- **PUT** `/api/auth/updatedetails`
- **PUT** `/api/auth/updatepassword`
- **POST** `/api/auth/forgotpassword`
- **PUT** `/api/auth/resetpassword/:token`
- **PUT** `/api/auth/preferences`

### sensorService.js
- **GET** `/api/sensors`
- **GET** `/api/sensors/:id`
- **POST** `/api/sensors`
- **PUT** `/api/sensors/:id`
- **DELETE** `/api/sensors/:id`
- **GET** `/api/sensors/:id/readings`
- **POST** `/api/sensors/:id/readings`
- **GET** `/api/sensors/status`
- **GET** `/api/sensors/:id/thresholds`
- **PUT** `/api/sensors/:id/thresholds`

### alertService.js
- **GET** `/api/alerts`
- **GET** `/api/alerts/:id`
- **POST** `/api/alerts`
- **PUT** `/api/alerts/:id`
- **DELETE** `/api/alerts/:id`
- **PUT** `/api/alerts/:id/acknowledge`
- **PUT** `/api/alerts/:id/resolve`
- **GET** `/api/alerts/active`
- **POST** `/api/alerts/test`

### threatZoneService.js
- **GET** `/api/threat-zones`
- **GET** `/api/threat-zones/:id`
- **POST** `/api/threat-zones`
- **PUT** `/api/threat-zones/:id`
- **DELETE** `/api/threat-zones/:id`
- **PUT** `/api/threat-zones/:id/deactivate`
- **GET** `/api/threat-zones/active`
- **GET** `/api/threat-zones/locations/:locationId/active`
- **POST** `/api/threat-zones/predict`
- **GET** `/api/threat-zones/locations/:locationId/history`
- **POST** `/api/threat-zones/predict-all`

### notificationService.js
- **GET** `/api/notifications`
- **GET** `/api/notifications/:id`
- **PUT** `/api/notifications/:id/read`
- **PUT** `/api/notifications/read-all`
- **DELETE** `/api/notifications/:id`
- **DELETE** `/api/notifications/read`

### socketService.js
- **WebSocket** `/ws` - Real-time updates for:
  - Sensor readings
  - Alert events
  - Threat zone updates
  - System notifications

## Custom Hooks Mapping

### useAuth.js
- Uses `authService.js` endpoints

### useSensors.js
- Uses `sensorService.js` endpoints

### useAlerts.js
- Uses `alertService.js` endpoints

### useThreatZones.js
- Uses `threatZoneService.js` endpoints

### useNotifications.js
- Uses `notificationService.js` endpoints

### useWebSocket.js
- Uses WebSocket connection `/ws`

## Context Providers

### AuthContext.jsx
- Manages authentication state using `authService.js`

### AlertContext.jsx
- Manages alert state using `alertService.js` and WebSocket

### NotificationContext.jsx
- Manages notifications using `notificationService.js` and WebSocket

### ThemeContext.jsx
- Client-side only (no API calls)

## Additional Endpoints Needed

Based on your frontend structure, you may also need:

### Report Endpoints
- **GET** `/api/reports/incidents` - Incident reports
- **GET** `/api/reports/sensors` - Sensor data reports
- **GET** `/api/reports/alerts` - Alert activity reports
- **POST** `/api/reports/export` - Export data

### Location Endpoints (Additional)
- **PUT** `/api/locations/:id` - Update location
- **DELETE** `/api/locations/:id` - Delete location

### User Management (Additional)
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

This mapping ensures that every frontend component has the necessary API endpoints to function properly. The API design provides comprehensive coverage for all the functionality described in your frontend architecture.
