# API Design for Threat Monitoring System

## Base Configuration
- **Base URL**: `/api`
- **Authentication**: JWT Bearer tokens
- **Content-Type**: `application/json`
- **Response Format**: JSON

## Authentication Endpoints

### POST /api/auth/login
**Purpose**: User login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin|user|operator",
    "permissions": ["read:sensors", "write:alerts"],
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "alertThreshold": "medium"
    }
  }
}
```

### POST /api/auth/register
**Purpose**: User registration
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### GET /api/auth/logout
**Purpose**: User logout
```json
Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
**Purpose**: Get current user profile
```json
Response:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "permissions": ["read:sensors", "write:alerts"],
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "alertThreshold": "medium"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /api/auth/updatedetails
**Purpose**: Update user profile
```json
Request:
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "john.smith@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "admin"
  }
}
```

### PUT /api/auth/updatepassword
**Purpose**: Change user password
```json
Request:
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Password updated successfully"
}
```

### POST /api/auth/forgotpassword
**Purpose**: Request password reset
```json
Request:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset email sent"
}
```

### PUT /api/auth/resetpassword/:token
**Purpose**: Reset password with token
```json
Request:
{
  "password": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

### PUT /api/auth/preferences
**Purpose**: Update user preferences
```json
Request:
{
  "theme": "dark",
  "notifications": true,
  "alertThreshold": "high",
  "emailNotifications": true,
  "smsNotifications": false
}

Response:
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "alertThreshold": "high",
    "emailNotifications": true,
    "smsNotifications": false
  }
}
```

### POST /api/auth/webpush
**Purpose**: Register web push subscription
```json
Request:
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "key_here",
      "auth": "auth_key_here"
    }
  }
}

Response:
{
  "success": true,
  "message": "Push subscription registered"
}
```

## Sensor Management Endpoints

### GET /api/sensors
**Purpose**: Get all sensors
```json
Query Parameters:
- location: string (optional)
- status: string (optional) - "active|inactive|error"
- type: string (optional) - "temperature|humidity|air_quality|motion"
- page: number (optional, default: 1)
- limit: number (optional, default: 20)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Temperature Sensor 1",
      "type": "temperature",
      "location": {
        "id": 1,
        "name": "Building A - Floor 1",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "status": "active",
      "lastReading": {
        "value": 22.5,
        "unit": "°C",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      "thresholds": {
        "min": 18,
        "max": 25,
        "critical_min": 15,
        "critical_max": 30
      },
      "batteryLevel": 85,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### GET /api/sensors/:id
**Purpose**: Get single sensor details
```json
Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Temperature Sensor 1",
    "type": "temperature",
    "description": "Main lobby temperature monitoring",
    "location": {
      "id": 1,
      "name": "Building A - Floor 1",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "status": "active",
    "configuration": {
      "readingInterval": 300,
      "transmissionInterval": 600,
      "calibrationOffset": 0.5
    },
    "thresholds": {
      "min": 18,
      "max": 25,
      "critical_min": 15,
      "critical_max": 30
    },
    "batteryLevel": 85,
    "lastMaintenance": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### POST /api/sensors
**Purpose**: Create new sensor
```json
Request:
{
  "name": "Temperature Sensor 2",
  "type": "temperature",
  "description": "Conference room temperature monitoring",
  "locationId": 2,
  "configuration": {
    "readingInterval": 300,
    "transmissionInterval": 600,
    "calibrationOffset": 0.0
  },
  "thresholds": {
    "min": 18,
    "max": 25,
    "critical_min": 15,
    "critical_max": 30
  }
}

Response:
{
  "success": true,
  "message": "Sensor created successfully",
  "data": {
    "id": 2,
    "name": "Temperature Sensor 2",
    "type": "temperature",
    "status": "inactive",
    "locationId": 2,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /api/sensors/:id
**Purpose**: Update sensor
```json
Request:
{
  "name": "Updated Sensor Name",
  "description": "Updated description",
  "configuration": {
    "readingInterval": 600,
    "transmissionInterval": 1200
  }
}

Response:
{
  "success": true,
  "message": "Sensor updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Sensor Name",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### DELETE /api/sensors/:id
**Purpose**: Delete sensor
```json
Response:
{
  "success": true,
  "message": "Sensor deleted successfully"
}
```

### GET /api/sensors/:id/readings
**Purpose**: Get sensor readings
```json
Query Parameters:
- startDate: string (ISO date, optional)
- endDate: string (ISO date, optional)
- interval: string (optional) - "hour|day|week|month"
- page: number (optional)
- limit: number (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sensorId": 1,
      "value": 22.5,
      "unit": "°C",
      "timestamp": "2024-01-15T10:30:00Z",
      "quality": "good"
    }
  ],
  "statistics": {
    "average": 22.3,
    "min": 20.1,
    "max": 24.8,
    "count": 144
  },
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1440,
    "pages": 15
  }
}
```

### POST /api/sensors/:id/readings
**Purpose**: Submit sensor reading
```json
Request:
{
  "value": 23.2,
  "timestamp": "2024-01-15T10:30:00Z",
  "quality": "good"
}

Response:
{
  "success": true,
  "message": "Reading recorded successfully",
  "data": {
    "id": 1001,
    "sensorId": 1,
    "value": 23.2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/sensors/status
**Purpose**: Get sensor status overview
```json
Response:
{
  "success": true,
  "data": {
    "total": 50,
    "active": 45,
    "inactive": 3,
    "error": 2,
    "lowBattery": 5,
    "byType": {
      "temperature": 20,
      "humidity": 15,
      "air_quality": 10,
      "motion": 5
    },
    "recentAlerts": 3,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/sensors/:id/thresholds
**Purpose**: Get sensor thresholds
```json
Response:
{
  "success": true,
  "data": {
    "sensorId": 1,
    "thresholds": {
      "min": 18,
      "max": 25,
      "critical_min": 15,
      "critical_max": 30
    },
    "alertEnabled": true,
    "escalationRules": [
      {
        "condition": "value > critical_max",
        "action": "immediate_alert",
        "recipients": ["admin@example.com"]
      }
    ]
  }
}
```

### PUT /api/sensors/:id/thresholds
**Purpose**: Update sensor thresholds
```json
Request:
{
  "thresholds": {
    "min": 16,
    "max": 26,
    "critical_min": 12,
    "critical_max": 32
  },
  "alertEnabled": true
}

Response:
{
  "success": true,
  "message": "Thresholds updated successfully",
  "data": {
    "sensorId": 1,
    "thresholds": {
      "min": 16,
      "max": 26,
      "critical_min": 12,
      "critical_max": 32
    }
  }
}
```

## Alert Management Endpoints

### GET /api/alerts
**Purpose**: Get all alerts
```json
Query Parameters:
- status: string (optional) - "active|acknowledged|resolved"
- severity: string (optional) - "low|medium|high|critical"
- startDate: string (ISO date, optional)
- endDate: string (ISO date, optional)
- locationId: number (optional)
- page: number (optional)
- limit: number (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "High Temperature Alert",
      "message": "Temperature sensor reading exceeds threshold",
      "severity": "high",
      "status": "active",
      "type": "sensor_threshold",
      "source": {
        "type": "sensor",
        "id": 1,
        "name": "Temperature Sensor 1"
      },
      "location": {
        "id": 1,
        "name": "Building A - Floor 1",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "triggerValue": 28.5,
      "threshold": 25,
      "affectedAreas": ["Building A", "Floor 1"],
      "createdAt": "2024-01-15T10:30:00Z",
      "acknowledgedAt": null,
      "acknowledgedBy": null,
      "resolvedAt": null,
      "resolvedBy": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

### GET /api/alerts/:id
**Purpose**: Get single alert details
```json
Response:
{
  "success": true,
  "data": {
    "id": 1,
    "title": "High Temperature Alert",
    "message": "Temperature sensor reading exceeds threshold",
    "description": "Detailed description of the alert condition",
    "severity": "high",
    "status": "active",
    "type": "sensor_threshold",
    "source": {
      "type": "sensor",
      "id": 1,
      "name": "Temperature Sensor 1"
    },
    "location": {
      "id": 1,
      "name": "Building A - Floor 1",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "triggerValue": 28.5,
    "threshold": 25,
    "affectedAreas": ["Building A", "Floor 1"],
    "recommendedActions": [
      "Check HVAC system",
      "Evacuate if necessary",
      "Contact maintenance"
    ],
    "escalationLevel": 1,
    "notificationsSent": [
      {
        "type": "email",
        "recipient": "admin@example.com",
        "sentAt": "2024-01-15T10:31:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "acknowledgedAt": null,
    "acknowledgedBy": null,
    "resolvedAt": null,
    "resolvedBy": null
  }
}
```

### POST /api/alerts
**Purpose**: Create new alert
```json
Request:
{
  "title": "Manual Alert",
  "message": "Manual alert created by operator",
  "severity": "medium",
  "type": "manual",
  "locationId": 1,
  "affectedAreas": ["Building A"],
  "recommendedActions": ["Check area", "Report status"]
}

Response:
{
  "success": true,
  "message": "Alert created successfully",
  "data": {
    "id": 2,
    "title": "Manual Alert",
    "severity": "medium",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /api/alerts/:id
**Purpose**: Update alert
```json
Request:
{
  "title": "Updated Alert Title",
  "message": "Updated alert message",
  "severity": "high"
}

Response:
{
  "success": true,
  "message": "Alert updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Alert Title",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### DELETE /api/alerts/:id
**Purpose**: Delete alert
```json
Response:
{
  "success": true,
  "message": "Alert deleted successfully"
}
```

### PUT /api/alerts/:id/acknowledge
**Purpose**: Acknowledge alert
```json
Request:
{
  "notes": "Alert acknowledged, investigating issue"
}

Response:
{
  "success": true,
  "message": "Alert acknowledged successfully",
  "data": {
    "id": 1,
    "status": "acknowledged",
    "acknowledgedAt": "2024-01-15T10:35:00Z",
    "acknowledgedBy": {
      "id": 1,
      "name": "John Doe"
    }
  }
}
```

### PUT /api/alerts/:id/resolve
**Purpose**: Resolve alert
```json
Request:
{
  "resolution": "Issue resolved by restarting HVAC system",
  "notes": "Temperature returned to normal levels"
}

Response:
{
  "success": true,
  "message": "Alert resolved successfully",
  "data": {
    "id": 1,
    "status": "resolved",
    "resolvedAt": "2024-01-15T11:00:00Z",
    "resolvedBy": {
      "id": 1,
      "name": "John Doe"
    }
  }
}
```

### GET /api/alerts/active
**Purpose**: Get active alerts only
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "High Temperature Alert",
      "severity": "high",
      "status": "active",
      "location": {
        "id": 1,
        "name": "Building A - Floor 1"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

### POST /api/alerts/test
**Purpose**: Send test alert
```json
Request:
{
  "type": "email",
  "recipient": "test@example.com",
  "message": "This is a test alert"
}

Response:
{
  "success": true,
  "message": "Test alert sent successfully"
}
```

## Threat Zone Management Endpoints

### GET /api/threat-zones
**Purpose**: Get all threat zones
```json
Query Parameters:
- status: string (optional) - "active|inactive|predicted"
- severity: string (optional) - "low|medium|high|critical"
- locationId: number (optional)
- page: number (optional)
- limit: number (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "High Risk Zone Alpha",
      "description": "Predicted high-risk area based on sensor data",
      "status": "active",
      "severity": "high",
      "threatLevel": 8.5,
      "location": {
        "id": 1,
        "name": "Building A - Floor 1",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "boundaries": {
        "type": "polygon",
        "coordinates": [
          [40.7128, -74.0060],
          [40.7130, -74.0058],
          [40.7132, -74.0062],
          [40.7128, -74.0060]
        ]
      },
      "affectedAreas": ["Building A", "Parking Lot"],
      "estimatedPopulation": 150,
      "evacuationRoutes": [
        {
          "id": 1,
          "name": "Route A",
          "description": "Main exit via lobby"
        }
      ],
      "predictionModel": {
        "algorithm": "ml_ensemble",
        "confidence": 0.85,
        "factors": ["temperature", "humidity", "wind_speed"]
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-01-15T16:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### GET /api/threat-zones/:id
**Purpose**: Get single threat zone details
```json
Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "High Risk Zone Alpha",
    "description": "Predicted high-risk area based on sensor data",
    "status": "active",
    "severity": "high",
    "threatLevel": 8.5,
    "location": {
      "id": 1,
      "name": "Building A - Floor 1",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "boundaries": {
      "type": "polygon",
      "coordinates": [
        [40.7128, -74.0060],
        [40.7130, -74.0058],
        [40.7132, -74.0062],
        [40.7128, -74.0060]
      ]
    },
    "affectedAreas": ["Building A", "Parking Lot"],
    "estimatedPopulation": 150,
    "evacuationRoutes": [
      {
        "id": 1,
        "name": "Route A",
        "description": "Main exit via lobby",
        "waypoints": [
          {"lat": 40.7128, "lng": -74.0060},
          {"lat": 40.7125, "lng": -74.0055}
        ],
        "estimatedTime": "5 minutes",
        "capacity": 200
      }
    ],
    "predictionModel": {
      "algorithm": "ml_ensemble",
      "confidence": 0.85,
      "factors": ["temperature", "humidity", "wind_speed"],
      "inputData": {
        "temperature": 28.5,
        "humidity": 75,
        "wind_speed": 15
      }
    },
    "relatedAlerts": [1, 3],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-01-15T16:30:00Z"
  }
}
```

### POST /api/threat-zones
**Purpose**: Create new threat zone
```json
Request:
{
  "name": "Manual Threat Zone",
  "description": "Manually created threat zone",
  "severity": "medium",
  "locationId": 1,
  "boundaries": {
    "type": "polygon",
    "coordinates": [
      [40.7128, -74.0060],
      [40.7130, -74.0058],
      [40.7132, -74.0062],
      [40.7128, -74.0060]
    ]
  },
  "affectedAreas": ["Building B"],
  "estimatedPopulation": 100,
  "expiresAt": "2024-01-15T18:00:00Z"
}

Response:
{
  "success": true,
  "message": "Threat zone created successfully",
  "data": {
    "id": 2,
    "name": "Manual Threat Zone",
    "status": "active",
    "severity": "medium",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /api/threat-zones/:id
**Purpose**: Update threat zone
```json
Request:
{
  "name": "Updated Threat Zone",
  "severity": "high",
  "estimatedPopulation": 200
}

Response:
{
  "success": true,
  "message": "Threat zone updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Threat Zone",
    "severity": "high",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### DELETE /api/threat-zones/:id
**Purpose**: Delete threat zone
```json
Response:
{
  "success": true,
  "message": "Threat zone deleted successfully"
}
```

### PUT /api/threat-zones/:id/deactivate
**Purpose**: Deactivate threat zone
```json
Request:
{
  "reason": "Threat no longer present",
  "notes": "Environmental conditions have improved"
}

Response:
{
  "success": true,
  "message": "Threat zone deactivated successfully",
  "data": {
    "id": 1,
    "status": "inactive",
    "deactivatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### GET /api/threat-zones/active
**Purpose**: Get active threat zones only
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "High Risk Zone Alpha",
      "severity": "high",
      "threatLevel": 8.5,
      "location": {
        "id": 1,
        "name": "Building A - Floor 1"
      },
      "estimatedPopulation": 150,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

### GET /api/threat-zones/locations/:locationId/active
**Purpose**: Get active threat zones for specific location
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "High Risk Zone Alpha",
      "severity": "high",
      "threatLevel": 8.5,
      "boundaries": {
        "type": "polygon",
        "coordinates": [
          [40.7128, -74.0060],
          [40.7130, -74.0058],
          [40.7132, -74.0062],
          [40.7128, -74.0060]
        ]
      },
      "estimatedPopulation": 150,
      "evacuationRoutes": [
        {
          "id": 1,
          "name": "Route A",
          "description": "Main exit via lobby"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "location": {
    "id": 1,
    "name": "Building A - Floor 1"
  }
}
```

### POST /api/threat-zones/predict
**Purpose**: Generate threat zone prediction
```json
Request:
{
  "locationId": 1,
  "modelType": "ml_ensemble",
  "inputData": {
    "temperature": 28.5,
    "humidity": 75,
    "wind_speed": 15,
    "air_quality": 150
  },
  "timeHorizon": "6h"
}

Response:
{
  "success": true,
  "data": {
    "predictionId": "pred_123",
    "threatLevel": 7.2,
    "confidence": 0.82,
    "severity": "high",
    "predictedZone": {
      "boundaries": {
        "type": "polygon",
        "coordinates": [
          [40.7128, -74.0060],
          [40.7130, -74.0058],
          [40.7132, -74.0062],
          [40.7128, -74.0060]
        ]
      },
      "estimatedPopulation": 120,
      "riskFactors": [
        {
          "factor": "temperature",
          "weight": 0.4,
          "value": 28.5
        },
        {
          "factor": "wind_speed",
          "weight": 0.3,
          "value": 15
        }
      ]
    },
    "recommendedActions": [
      "Monitor temperature closely",
      "Prepare evacuation routes",
      "Alert nearby personnel"
    ],
    "validUntil": "2024-01-15T16:30:00Z",
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/threat-zones/locations/:locationId/history
**Purpose**: Get threat zone history for location
```json
Query Parameters:
- startDate: string (ISO date, optional)
- endDate: string (ISO date, optional)
- page: number (optional)
- limit: number (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Historical Zone 1",
      "severity": "medium",
      "threatLevel": 6.5,
      "status": "resolved",
      "duration": "2h 30m",
      "affectedPopulation": 85,
      "createdAt": "2024-01-14T08:00:00Z",
      "resolvedAt": "2024-01-14T10:30:00Z"
    }
  ],
  "statistics": {
    "totalIncidents": 15,
    "averageDuration": "1h 45m",
    "severityBreakdown": {
      "low": 5,
      "medium": 7,
      "high": 3,
      "critical": 0
    }
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

### POST /api/threat-zones/predict-all
**Purpose**: Run predictions for all locations
```json
Request:
{
  "modelType": "ml_ensemble",
  "timeHorizon": "6h"
}

Response:
{
  "success": true,
  "message": "Prediction job started",
  "data": {
    "jobId": "job_456",
    "status": "running",
    "estimatedCompletion": "2024-01-15T10:35:00Z",
    "locationsCount": 25
  }
}
```

## Location Management Endpoints

### GET /api/locations
**Purpose**: Get all locations
```json
Query Parameters:
- type: string (optional) - "building|floor|room|outdoor"
- hasActiveSensors: boolean (optional)
- page: number (optional)
- limit: number (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Building A - Floor 1",
      "type": "floor",
      "description": "Main office floor",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "address": "123 Main St, New York, NY",
      "capacity": 200,
      "currentOccupancy": 150,
      "parentLocation": {
        "id": 10,
        "name": "Building A"
      },
      "sensors": [
        {
          "id": 1,
          "name": "Temperature Sensor 1",
          "type": "temperature",
          "status": "active"
        }
      ],
      "activeThreatZones": 1,
      "activeAlerts": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### POST /api/locations
**Purpose**: Create new location
```json
Request:
{
  "name": "Building B - Floor 2",
  "type": "floor",
  "description": "Secondary office floor",
  "coordinates": {
    "lat": 40.7130,
    "lng": -74.0062
  },
  "address": "125 Main St, New York, NY",
  "capacity": 180,
  "parentLocationId": 11
}

Response:
{
  "success": true,
  "message": "Location created successfully",
  "data": {
    "id": 2,
    "name": "Building B - Floor 2",
    "type": "floor",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/locations/:id/sensors
**Purpose**: Get sensors for specific location
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Temperature Sensor 1",
      "type": "temperature",
      "status": "active",
      "lastReading": {
        "value": 22.5,
        "unit": "°C",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      "batteryLevel": 85
    }
  ],
  "statistics": {
    "total": 5,
    "active": 4,
    "inactive": 1,
    "lowBattery": 1
  }
}
```

## Notification Management Endpoints

### GET /api/notifications
**Purpose**: Get user notifications
```json
Query Parameters:
- status: string (optional) - "read|unread"
- type: string (optional) - "alert|system|info"
- page: number (optional)
- limit: number (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "High Temperature Alert",
      "message": "Temperature sensor reading exceeds threshold in Building A",
      "type": "alert",
      "severity": "high",
      "status": "unread",
      "relatedEntity": {
        "type": "alert",
        "id": 1
      },
      "actionUrl": "/alerts/1",
      "createdAt": "2024-01-15T10:30:00Z",
      "readAt": null
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

### GET /api/notifications/:id
**Purpose**: Get single notification
```json
Response:
{
  "success": true,
  "data": {
    "id": 1,
    "title": "High Temperature Alert",
    "message": "Temperature sensor reading exceeds threshold in Building A",
    "description": "Detailed notification description with additional context",
    "type": "alert",
    "severity": "high",
    "status": "unread",
    "relatedEntity": {
      "type": "alert",
      "id": 1,
      "title": "High Temperature Alert"
    },
    "actionUrl": "/alerts/1",
    "metadata": {
      "sensorId": 1,
      "locationId": 1,
      "triggerValue": 28.5
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "readAt": null
  }
}
```

### PUT /api/notifications/:id/read
**Purpose**: Mark notification as read
```json
Response:
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": 1,
    "status": "read",
    "readAt": "2024-01-15T10:35:00Z"
  }
}
```

### PUT /api/notifications/read-all
**Purpose**: Mark all notifications as read
```json
Response:
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "markedCount": 5,
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```

### DELETE /api/notifications/:id
**Purpose**: Delete notification
```json
Response:
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

### DELETE /api/notifications/read
**Purpose**: Delete all read notifications
```json
Response:
{
  "success": true,
  "message": "Read notifications deleted successfully",
  "data": {
    "deletedCount": 10
  }
}
```

## User Management Endpoints

### GET /api/users
**Purpose**: Get all users (Admin only)
```json
Query Parameters:
- role: string (optional) - "admin|user|operator"
- status: string (optional) - "active|inactive"
- page: number (optional)
- limit: number (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "status": "active",
      "permissions": ["read:sensors", "write:alerts", "admin:users"],
      "lastLogin": "2024-01-15T09:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

### POST /api/users
**Purpose**: Create new user (Admin only)
```json
Request:
{
  "email": "new.user@example.com",
  "firstName": "New",
  "lastName": "User",
  "role": "user",
  "password": "temporaryPassword123",
  "permissions": ["read:sensors", "read:alerts"]
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "email": "new.user@example.com",
    "firstName": "New",
    "lastName": "User",
    "role": "user",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Admin Endpoints

### GET /api/admin/dashboard
**Purpose**: Get admin dashboard data
```json
Response:
{
  "success": true,
  "data": {
    "systemHealth": {
      "status": "healthy",
      "uptime": "15d 8h 32m",
      "lastRestart": "2024-01-01T00:00:00Z"
    },
    "statistics": {
      "totalSensors": 50,
      "activeSensors": 45,
      "totalLocations": 25,
      "totalUsers": 15,
      "activeAlerts": 3,
      "activeThreatZones": 1
    },
    "recentActivity": [
      {
        "type": "alert_created",
        "message": "High temperature alert in Building A",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "systemAlerts": [
      {
        "type": "sensor_offline",
        "message": "Sensor 15 has been offline for 2 hours",
        "severity": "medium",
        "timestamp": "2024-01-15T08:30:00Z"
      }
    ]
  }
}
```

### GET /api/admin/system-health
**Purpose**: Get detailed system health information
```json
Response:
{
  "success": true,
  "data": {
    "database": {
      "status": "healthy",
      "connectionPool": {
        "active": 5,
        "idle": 10,
        "max": 20
      },
      "responseTime": "15ms"
    },
    "services": {
      "predictionEngine": {
        "status": "healthy",
        "lastRun": "2024-01-15T10:00:00Z",
        "averageProcessingTime": "2.5s"
      },
      "notificationService": {
        "status": "healthy",
        "queueSize": 5,
        "lastDelivery": "2024-01-15T10:29:00Z"
      }
    },
    "resources": {
      "cpu": {
        "usage": 45,
        "cores": 8
      },
      "memory": {
        "used": "2.1GB",
        "total": "8GB",
        "percentage": 26
      },
      "disk": {
        "used": "150GB",
        "total": "500GB",
        "percentage": 30
      }
    }
  }
}
```

### POST /api/admin/maintenance
**Purpose**: Trigger maintenance operations
```json
Request:
{
  "operation": "cleanup_old_data",
  "parameters": {
    "olderThan": "90d",
    "dataTypes": ["sensor_readings", "resolved_alerts"]
  }
}

Response:
{
  "success": true,
  "message": "Maintenance operation started",
  "data": {
    "jobId": "maint_789",
    "estimatedDuration": "30m",
    "status": "running"
  }
}
```

### POST /api/admin/backup
**Purpose**: Create system backup
```json
Request:
{
  "type": "full",
  "includeFiles": true,
  "compression": true
}

Response:
{
  "success": true,
  "message": "Backup started",
  "data": {
    "backupId": "backup_456",
    "estimatedSize": "2.5GB",
    "estimatedDuration": "45m",
    "status": "running"
  }
}
```

## Dashboard Endpoints

### GET /api/dashboard/user
**Purpose**: Get user-specific dashboard data
```json
Response:
{
  "success": true,
  "data": {
    "userInfo": {
      "id": 1,
      "name": "John Doe",
      "role": "user",
      "assignedLocations": [1, 2, 3]
    },
    "relevantAlerts": [
      {
        "id": 1,
        "title": "High Temperature Alert",
        "severity": "high",
        "location": "Building A - Floor 1",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "assignedSensors": [
      {
        "id": 1,
        "name": "Temperature Sensor 1",
        "status": "active",
        "lastReading": {
          "value": 22.5,
          "timestamp": "2024-01-15T10:30:00Z"
        }
      }
    ],
    "threatZones": [
      {
        "id": 1,
        "name": "High Risk Zone Alpha",
        "severity": "high",
        "affectsUser": true
      }
    ],
    "notifications": {
      "unread": 3,
      "recent": [
        {
          "id": 1,
          "title": "Alert Notification",
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ]
    }
  }
}
```

## WebSocket Events

### Connection
```
Endpoint: /ws
Authentication: JWT token in query parameter or header
```

### Event Types

#### Sensor Data Updates
```json
{
  "type": "sensor_reading",
  "data": {
    "sensorId": 1,
    "value": 23.5,
    "unit": "°C",
    "timestamp": "2024-01-15T10:30:00Z",
    "location": {
      "id": 1,
      "name": "Building A - Floor 1"
    }
  }
}
```

#### Alert Events
```json
{
  "type": "alert_created",
  "data": {
    "id": 1,
    "title": "High Temperature Alert",
    "severity": "high",
    "location": {
      "id": 1,
      "name": "Building A - Floor 1"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Threat Zone Updates
```json
{
  "type": "threat_zone_updated",
  "data": {
    "id": 1,
    "name": "High Risk Zone Alpha",
    "status": "active",
    "severity": "high",
    "threatLevel": 8.5,
    "location": {
      "id": 1,
      "name": "Building A - Floor 1"
    }
  }
}
```

#### System Notifications
```json
{
  "type": "system_notification",
  "data": {
    "id": 1,
    "title": "System Maintenance",
    "message": "Scheduled maintenance will begin in 30 minutes",
    "type": "info",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid or missing authentication
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate email)
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

## Rate Limiting
- **General API**: 1000 requests per hour per user
- **Authentication**: 10 requests per minute per IP
- **WebSocket**: 100 messages per minute per connection

## Pagination
All list endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```