import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock admin dashboard data
    const mockDashboardData = {
      systemHealth: {
        status: "healthy",
        uptime: "15d 8h 32m",
        lastRestart: "2024-01-01T00:00:00Z",
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 38,
        networkStatus: "stable"
      },
      statistics: {
        totalSensors: 50,
        activeSensors: 45,
        inactiveSensors: 3,
        errorSensors: 2,
        totalLocations: 25,
        totalUsers: 15,
        activeUsers: 12,
        activeAlerts: 3,
        activeThreatZones: 1,
        totalIncidents: 127,
        resolvedIncidents: 124
      },
      recentActivity: [
        {
          id: "1",
          type: "alert_created",
          message: "High temperature alert in Building B - Server Room",
          severity: "high",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          user: "system",
          details: {
            sensorId: "5",
            value: 28.9,
            threshold: 24
          }
        },
        {
          id: "2",
          type: "alert_acknowledged",
          message: "Low battery warning acknowledged by operator",
          severity: "medium",
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          user: "operator@threatguard.com",
          details: {
            alertId: "2",
            sensorId: "4"
          }
        },
        {
          id: "3",
          type: "sensor_offline",
          message: "Temperature Sensor 2 went offline",
          severity: "medium",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          user: "system",
          details: {
            sensorId: "5",
            lastSeen: new Date(Date.now() - 1800000).toISOString()
          }
        },
        {
          id: "4",
          type: "user_login",
          message: "Admin user logged in",
          severity: "info",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: "admin@threatguard.com",
          details: {
            ipAddress: "192.168.1.100",
            userAgent: "Mozilla/5.0..."
          }
        },
        {
          id: "5",
          type: "sensor_created",
          message: "New humidity sensor added to Building C",
          severity: "info",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: "admin@threatguard.com",
          details: {
            sensorId: "6",
            location: "Building C - Floor 1"
          }
        }
      ],
      systemAlerts: [
        {
          id: "sys_1",
          type: "sensor_offline",
          message: "Temperature Sensor 2 has been offline for 30 minutes",
          severity: "medium",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          affectedSystems: ["monitoring", "alerts"],
          recommendedAction: "Check sensor connectivity and power supply"
        },
        {
          id: "sys_2",
          type: "high_cpu_usage",
          message: "Server CPU usage has been above 80% for 10 minutes",
          severity: "low",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          affectedSystems: ["processing", "analytics"],
          recommendedAction: "Monitor system performance and consider scaling"
        }
      ],
      performanceMetrics: {
        responseTime: {
          average: 245,
          p95: 450,
          p99: 890
        },
        throughput: {
          requestsPerSecond: 125,
          dataPointsPerMinute: 3420
        },
        errorRates: {
          api: 0.02,
          sensors: 0.05,
          alerts: 0.01
        }
      },
      dataOverview: {
        sensorReadings: {
          last24Hours: 124800,
          lastWeek: 873600,
          lastMonth: 3744000
        },
        alertsGenerated: {
          last24Hours: 12,
          lastWeek: 89,
          lastMonth: 342
        },
        storageUsage: {
          total: "2.5TB",
          used: "950GB",
          available: "1.55TB",
          percentage: 38
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: mockDashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
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
