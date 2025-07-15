import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');

    // Mock recent activity data for gas pipeline monitoring
    const mockActivity = [
      {
        id: "1",
        type: "alert_created",
        title: "Critical Gas Leak Alert Created",
        description: "High gas concentration detected at Downtown Fire Station",
        user: {
          id: "system",
          name: "System",
          role: "system"
        },
        location: {
          id: "1",
          name: "Downtown Fire Station"
        },
        sensor: {
          id: "1",
          name: "Gas Sensor A1"
        },
        severity: "critical",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        metadata: {
          gasLevel: 9.1,
          threshold: 8.0,
          sensorType: "MQ2"
        }
      },
      {
        id: "2",
        type: "alert_acknowledged",
        title: "Pressure Anomaly Alert Acknowledged",
        description: "Pipeline pressure anomaly acknowledged by operator",
        user: {
          id: "operator123",
          name: "Operator User",
          role: "operator"
        },
        location: {
          id: "2",
          name: "Northside Emergency HQ"
        },
        sensor: {
          id: "2",
          name: "Pressure Sensor B2"
        },
        severity: "warning",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        metadata: {
          pressureLevel: 85.2,
          threshold: 80.0
        }
      },
      {
        id: "3",
        type: "sensor_reading",
        title: "Normal Gas Reading Recorded",
        description: "Gas sensor C3 recorded normal levels",
        user: {
          id: "system",
          name: "System",
          role: "system"
        },
        location: {
          id: "1",
          name: "Downtown Fire Station"
        },
        sensor: {
          id: "3",
          name: "Gas Sensor C3"
        },
        severity: "info",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: {
          gasLevel: 1.2,
          threshold: 2.0,
          sensorType: "MQ4"
        }
      },
      {
        id: "4",
        type: "threat_zone_created",
        title: "Threat Zone Activated",
        description: "Critical threat zone activated around Downtown Fire Station",
        user: {
          id: "system",
          name: "AI Prediction System",
          role: "system"
        },
        location: {
          id: "1",
          name: "Downtown Fire Station"
        },
        severity: "critical",
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        metadata: {
          threatLevel: 8.5,
          confidence: 0.92,
          affectedRadius: 500
        }
      },
      {
        id: "5",
        type: "user_login",
        title: "Admin User Logged In",
        description: "Administrator logged into the system",
        user: {
          id: "admin123",
          name: "Admin User",
          role: "admin"
        },
        severity: "info",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        metadata: {
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0..."
        }
      },
      {
        id: "6",
        type: "sensor_offline",
        title: "Sensor Communication Lost",
        description: "Lost communication with gas sensor B2",
        user: {
          id: "system",
          name: "System",
          role: "system"
        },
        location: {
          id: "2",
          name: "Northside Emergency HQ"
        },
        sensor: {
          id: "2",
          name: "Gas Sensor B2"
        },
        severity: "warning",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        metadata: {
          lastSeen: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
          batteryLevel: 30
        }
      },
      {
        id: "7",
        type: "maintenance_scheduled",
        title: "Maintenance Scheduled",
        description: "Routine maintenance scheduled for pipeline section C",
        user: {
          id: "admin123",
          name: "Admin User",
          role: "admin"
        },
        location: {
          id: "1",
          name: "Downtown Fire Station"
        },
        severity: "info",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        metadata: {
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: "4 hours",
          affectedSensors: ["SENS-C3", "SENS-C4"]
        }
      },
      {
        id: "8",
        type: "alert_resolved",
        title: "Sensor Offline Alert Resolved",
        description: "Communication restored with gas sensor C3",
        user: {
          id: "admin123",
          name: "Admin User",
          role: "admin"
        },
        location: {
          id: "1",
          name: "Downtown Fire Station"
        },
        sensor: {
          id: "3",
          name: "Gas Sensor C3"
        },
        severity: "info",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        metadata: {
          downtime: "2 hours",
          resolutionMethod: "Manual restart"
        }
      }
    ];

    // Apply type filter if specified
    let filteredActivity = mockActivity;
    if (type && type !== 'all') {
      filteredActivity = filteredActivity.filter(activity => activity.type === type);
    }

    // Apply limit
    const limitedActivity = filteredActivity.slice(0, limit);

    // Calculate summary statistics
    const summary = {
      total: filteredActivity.length,
      byType: {
        alert_created: filteredActivity.filter(a => a.type === 'alert_created').length,
        alert_acknowledged: filteredActivity.filter(a => a.type === 'alert_acknowledged').length,
        alert_resolved: filteredActivity.filter(a => a.type === 'alert_resolved').length,
        sensor_reading: filteredActivity.filter(a => a.type === 'sensor_reading').length,
        sensor_offline: filteredActivity.filter(a => a.type === 'sensor_offline').length,
        threat_zone_created: filteredActivity.filter(a => a.type === 'threat_zone_created').length,
        user_login: filteredActivity.filter(a => a.type === 'user_login').length,
        maintenance_scheduled: filteredActivity.filter(a => a.type === 'maintenance_scheduled').length
      },
      bySeverity: {
        critical: filteredActivity.filter(a => a.severity === 'critical').length,
        warning: filteredActivity.filter(a => a.severity === 'warning').length,
        info: filteredActivity.filter(a => a.severity === 'info').length
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        activities: limitedActivity,
        summary
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard activity API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard activity' },
      { status: 500 }
    );
  }
}
