import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Gas pipeline monitoring alerts
    const mockAlerts = [
      {
        id: "1",
        title: "High Gas Concentration Detected",
        description: "MQ2 sensor detected dangerous gas levels in pipeline section A1",
        severity: "critical",
        status: "active",
        type: "gas_leak",
        location: {
          id: "1",
          name: "Downtown Fire Station",
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        sensor: {
          id: "1",
          name: "Gas Sensor A1",
          type: "multi"
        },
        readings: {
          mq2: 9.1,
          temperature: 33.5,
          humidity: 40
        },
        thresholds: {
          mq2: { warning: 2, danger: 5, critical: 8 }
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        acknowledgedBy: null,
        acknowledgedAt: null,
        resolvedBy: null,
        resolvedAt: null,
        escalationLevel: 2,
        affectedArea: "500m radius",
        evacuationRequired: true,
        emergencyContacts: [
          { name: "Fire Department", phone: "+1-911", contacted: true },
          { name: "Gas Company", phone: "+1-555-0123", contacted: false }
        ],
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        title: "Pipeline Pressure Anomaly",
        description: "Unusual pressure readings detected in pipeline section B2",
        severity: "warning",
        status: "acknowledged",
        type: "pressure_anomaly",
        location: {
          id: "2",
          name: "Northside Emergency HQ",
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        sensor: {
          id: "2",
          name: "Pressure Sensor B2",
          type: "pressure"
        },
        readings: {
          pressure: 85.2,
          temperature: 31.0
        },
        thresholds: {
          pressure: { warning: 80, danger: 90, critical: 95 }
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        acknowledgedBy: "operator@threatguard.com",
        acknowledgedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        resolvedBy: null,
        resolvedAt: null,
        escalationLevel: 1,
        affectedArea: "200m radius",
        evacuationRequired: false,
        emergencyContacts: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "3",
        title: "Sensor Communication Lost",
        description: "Lost communication with gas sensor C3",
        severity: "medium",
        status: "resolved",
        type: "sensor_offline",
        location: {
          id: "1",
          name: "Downtown Fire Station",
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        sensor: {
          id: "3",
          name: "Gas Sensor C3",
          type: "mq4"
        },
        readings: null,
        thresholds: null,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        acknowledgedBy: "admin@threatguard.com",
        acknowledgedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        resolvedBy: "admin@threatguard.com",
        resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        escalationLevel: 0,
        affectedArea: "Sensor location only",
        evacuationRequired: false,
        emergencyContacts: [],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Apply filters
    let filteredAlerts = mockAlerts;

    if (status && status !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    if (severity && severity !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    if (location && location !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.location.id === location);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
      total: filteredAlerts.length,
      active: filteredAlerts.filter(a => a.status === 'active').length,
      acknowledged: filteredAlerts.filter(a => a.status === 'acknowledged').length,
      resolved: filteredAlerts.filter(a => a.status === 'resolved').length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      warning: filteredAlerts.filter(a => a.severity === 'warning').length,
      medium: filteredAlerts.filter(a => a.severity === 'medium').length,
      low: filteredAlerts.filter(a => a.severity === 'low').length
    };

    return NextResponse.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        summary,
        pagination: {
          page,
          limit,
          total: filteredAlerts.length,
          pages: Math.ceil(filteredAlerts.length / limit)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alerts API error:', error);
    return NextResponse.json(
      { error: 'Failed to load alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const alertData = await request.json();
    
    // Mock creating an alert
    const newAlert = {
      id: Date.now().toString(),
      ...alertData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newAlert,
      message: 'Alert created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create alert error:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
