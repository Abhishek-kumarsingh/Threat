import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Mock user dashboard data for gas pipeline monitoring
    const mockUserDashboard = {
      userInfo: {
        id: "user123",
        name: "Regular User",
        role: "user",
        assignedLocations: [1, 2]
      },
      relevantAlerts: [
        {
          id: "1",
          title: "High Gas Concentration Detected",
          severity: "critical",
          status: "active",
          location: "Downtown Fire Station",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          description: "MQ2 sensor detected dangerous gas levels",
          actionRequired: true
        },
        {
          id: "2",
          title: "Pipeline Pressure Anomaly",
          severity: "warning",
          status: "acknowledged",
          location: "Northside Emergency HQ",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          description: "Unusual pressure readings detected",
          actionRequired: false
        }
      ],
      assignedSensors: [
        {
          id: "1",
          name: "Gas Sensor A1",
          type: "multi",
          status: "online",
          location: "Downtown Fire Station",
          lastReading: {
            mq2: 3.5,
            temperature: 31.2,
            timestamp: new Date().toISOString(),
            quality: "warning"
          },
          batteryLevel: 85
        },
        {
          id: "3",
          name: "Gas Sensor C3",
          type: "mq4",
          status: "online",
          location: "Downtown Fire Station",
          lastReading: {
            mq4: 1.2,
            temperature: 29.8,
            timestamp: new Date().toISOString(),
            quality: "good"
          },
          batteryLevel: 78
        }
      ],
      threatZones: [
        {
          id: "1",
          name: "Downtown Pipeline Critical Zone",
          threatLevel: 8.5,
          status: "active",
          location: "Downtown Fire Station",
          affectedArea: "500m radius",
          evacuationRequired: true,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ],
      notifications: {
        unread: 3,
        recent: [
          {
            id: "1",
            type: "alert",
            title: "Critical Gas Leak Alert",
            message: "High gas concentration detected at Downtown Fire Station",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            read: false,
            priority: "high"
          },
          {
            id: "2",
            type: "system",
            title: "Sensor Battery Low",
            message: "Gas Sensor B2 battery level is below 30%",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            priority: "medium"
          },
          {
            id: "3",
            type: "maintenance",
            title: "Scheduled Maintenance",
            message: "Pipeline section C will undergo maintenance tomorrow",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            read: false,
            priority: "low"
          }
        ]
      },
      quickStats: {
        sensorsMonitored: 2,
        activeAlerts: 1,
        threatZonesNearby: 1,
        lastLoginTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        systemStatus: "operational"
      },
      recentActivity: [
        {
          id: "1",
          type: "alert_acknowledged",
          description: "Acknowledged pressure anomaly alert",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          location: "Northside Emergency HQ"
        },
        {
          id: "2",
          type: "sensor_reading",
          description: "Normal gas levels recorded",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          location: "Downtown Fire Station"
        },
        {
          id: "3",
          type: "login",
          description: "User logged into system",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          location: "System"
        }
      ],
      emergencyContacts: [
        {
          name: "Fire Department",
          phone: "+1-911",
          type: "emergency"
        },
        {
          name: "Gas Company Emergency",
          phone: "+1-555-0123",
          type: "utility"
        },
        {
          name: "Site Supervisor",
          phone: "+1-555-0456",
          type: "internal"
        }
      ],
      weatherConditions: {
        temperature: 31.2,
        humidity: 45,
        windSpeed: 12.5,
        windDirection: "NE",
        pressure: 1013.25,
        visibility: "Good",
        lastUpdated: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: mockUserDashboard,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('User dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load user dashboard data' },
      { status: 500 }
    );
  }
}
