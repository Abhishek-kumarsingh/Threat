import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // For now, return mock dashboard data since we need to implement the models
    // TODO: Replace with actual database queries when models are properly set up
    const mockDashboardData = {
      summary: {
        totalSensors: 12,
        activeSensors: 10,
        inactiveSensors: 2,
        totalAlerts: 3,
        activeAlerts: 1,
        totalLocations: 2,
        activeThreatZones: 1
      },
      recentAlerts: [
        {
          id: '1',
          title: 'High Gas Concentration Detected',
          severity: 'critical',
          status: 'active',
          location: 'Downtown Fire Station',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          sensorType: 'MQ2'
        },
        {
          id: '2',
          title: 'Pipeline Pressure Anomaly',
          severity: 'warning',
          status: 'acknowledged',
          location: 'Northside Emergency HQ',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sensorType: 'Pressure'
        }
      ],
      sensorStatus: {
        online: 10,
        offline: 2,
        warning: 1,
        critical: 1,
        byType: {
          mq2: 3,
          mq4: 3,
          mq6: 3,
          mq8: 3
        }
      },
      recentReadings: [
        {
          id: '1',
          sensorName: 'Gas Sensor A1',
          sensorType: 'MQ2',
          value: 3.5,
          unit: 'ppm',
          status: 'warning',
          location: 'Downtown Fire Station',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          sensorName: 'Gas Sensor B2',
          sensorType: 'MQ2',
          value: 9.1,
          unit: 'ppm',
          status: 'critical',
          location: 'Northside Emergency HQ',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        }
      ],
      threatZones: [
        {
          id: '1',
          location: 'Downtown Fire Station',
          level: 'high',
          confidence: 0.85,
          affectedArea: '500m radius',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        }
      ],
      systemHealth: {
        status: 'healthy',
        uptime: '15d 8h 32m',
        lastUpdate: new Date().toISOString(),
        databaseStatus: 'connected',
        apiStatus: 'operational'
      }
    };

    return NextResponse.json({
      success: true,
      data: mockDashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
