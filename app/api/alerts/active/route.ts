import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock active alerts data
    const mockActiveAlerts = [
      {
        id: "1",
        title: "High Temperature Alert",
        message: "Temperature sensor reading exceeds threshold",
        description: "Server room temperature has exceeded safe operating limits",
        severity: "high",
        status: "active",
        type: "sensor_threshold",
        source: {
          type: "sensor",
          id: "5",
          name: "Temperature Sensor 2"
        },
        location: {
          id: "4",
          name: "Building B - Server Room",
          coordinates: {
            lat: 40.7140,
            lng: -74.0070
          }
        },
        triggerValue: 28.9,
        threshold: 24,
        affectedAreas: ["Building B", "Server Room"],
        recommendedActions: [
          "Check HVAC system",
          "Verify server cooling",
          "Contact maintenance immediately"
        ],
        escalationLevel: 2,
        notificationsSent: [
          {
            type: "email",
            recipient: "admin@threatguard.com",
            sentAt: new Date(Date.now() - 300000).toISOString()
          },
          {
            type: "sms",
            recipient: "+1234567890",
            sentAt: new Date(Date.now() - 240000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 600000).toISOString(),
        acknowledgedAt: null,
        acknowledgedBy: null,
        resolvedAt: null,
        resolvedBy: null
      },
      {
        id: "2",
        title: "Low Battery Warning",
        message: "Motion sensor battery level is critically low",
        description: "Motion Sensor 1 battery level has dropped below 20%",
        severity: "medium",
        status: "active",
        type: "battery_low",
        source: {
          type: "sensor",
          id: "4",
          name: "Motion Sensor 1"
        },
        location: {
          id: "3",
          name: "Building A - Entrance",
          coordinates: {
            lat: 40.7125,
            lng: -74.0062
          }
        },
        triggerValue: 15,
        threshold: 20,
        affectedAreas: ["Building A", "Entrance"],
        recommendedActions: [
          "Replace sensor battery",
          "Schedule maintenance",
          "Monitor sensor status"
        ],
        escalationLevel: 1,
        notificationsSent: [
          {
            type: "email",
            recipient: "maintenance@threatguard.com",
            sentAt: new Date(Date.now() - 1800000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 1200000).toISOString(),
        acknowledgedBy: "operator@threatguard.com",
        resolvedAt: null,
        resolvedBy: null
      },
      {
        id: "3",
        title: "Sensor Communication Lost",
        message: "Lost communication with temperature sensor",
        description: "Temperature Sensor 2 has not reported readings for over 30 minutes",
        severity: "medium",
        status: "active",
        type: "sensor_offline",
        source: {
          type: "sensor",
          id: "5",
          name: "Temperature Sensor 2"
        },
        location: {
          id: "4",
          name: "Building B - Server Room",
          coordinates: {
            lat: 40.7140,
            lng: -74.0070
          }
        },
        triggerValue: null,
        threshold: null,
        affectedAreas: ["Building B", "Server Room"],
        recommendedActions: [
          "Check sensor connectivity",
          "Verify network connection",
          "Inspect sensor hardware"
        ],
        escalationLevel: 1,
        notificationsSent: [
          {
            type: "email",
            recipient: "tech@threatguard.com",
            sentAt: new Date(Date.now() - 900000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        acknowledgedAt: null,
        acknowledgedBy: null,
        resolvedAt: null,
        resolvedBy: null
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockActiveAlerts,
      count: mockActiveAlerts.length,
      summary: {
        critical: mockActiveAlerts.filter(alert => alert.severity === 'critical').length,
        high: mockActiveAlerts.filter(alert => alert.severity === 'high').length,
        medium: mockActiveAlerts.filter(alert => alert.severity === 'medium').length,
        low: mockActiveAlerts.filter(alert => alert.severity === 'low').length,
        acknowledged: mockActiveAlerts.filter(alert => alert.acknowledgedAt !== null).length,
        unacknowledged: mockActiveAlerts.filter(alert => alert.acknowledgedAt === null).length
      }
    });

  } catch (error) {
    console.error('Get active alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
