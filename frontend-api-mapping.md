# Frontend Component to API Endpoint Mapping

## Authentication Components

### Login.jsx
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/me` - Validate existing session

### Register.jsx
- **POST** `/api/auth/register` - User registration

### ForgotPassword.jsx
- **POST** `/api/auth/forgotpassword` - Request password reset

### ResetPassword.jsx
- **PUT** `/api/auth/resetpassword/:token` - Reset password with token

## Admin Components

### AdminDashboard.jsx
- **GET** `/api/admin/dashboard` - System overview data
- **GET** `/api/alerts/active` - Active alerts
- **GET** `/api/sensors/status` - Sensor status overview
- **GET** `/api/threat-zones/active` - Active threat zones

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
