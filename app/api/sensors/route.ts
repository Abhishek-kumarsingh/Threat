import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Gas pipeline sensor data
    const mockSensors = [
      {
        id: "1",
        name: "Gas Sensor A1",
        sensorId: "SENS-A1",
        type: "multi",
        description: "Multi-gas sensor for pipeline monitoring",
        location: {
          id: "1",
          name: "Downtown Fire Station",
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        status: "online",
        lastReading: {
          mq2: 3.5,
          mq4: 2.1,
          mq6: 1.8,
          mq8: 2.7,
          temperature: 31.2,
          humidity: 45,
          timestamp: new Date().toISOString(),
          quality: "warning"
        },
        thresholds: {
          mq2: { warning: 2, danger: 5, critical: 8 },
          mq4: { warning: 2, danger: 5, critical: 8 },
          mq6: { warning: 2, danger: 5, critical: 8 },
          mq8: { warning: 2, danger: 5, critical: 8 }
        },
        batteryLevel: 85,
        manufacturer: "FireTech Inc.",
        model: "FT-MQX",
        serialNumber: "SN123456",
        firmwareVersion: "v2.0.1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "Gas Sensor B2",
        sensorId: "SENS-B2",
        type: "mq2",
        description: "MQ2 gas sensor for LPG/Propane detection",
        location: {
          id: "2",
          name: "Northside Emergency HQ",
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: "offline",
        lastReading: {
          mq2: 9.1,
          temperature: 33.5,
          humidity: 40,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          quality: "critical"
        },
        thresholds: {
          mq2: { warning: 2, danger: 5, critical: 8 }
        },
        batteryLevel: 30,
        manufacturer: "AirSafe Ltd.",
        model: "AS-MQ2",
        serialNumber: "SN789012",
        firmwareVersion: "v1.3.2",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "3",
        name: "Gas Sensor C3",
        sensorId: "SENS-C3",
        type: "mq4",
        description: "MQ4 methane gas sensor for natural gas detection",
        location: {
          id: "1",
          name: "Downtown Fire Station",
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        status: "online",
        lastReading: {
          mq4: 1.2,
          temperature: 29.8,
          humidity: 42,
          timestamp: new Date().toISOString(),
          quality: "good"
        },
        thresholds: {
          mq4: { warning: 2, danger: 5, critical: 8 }
        },
        batteryLevel: 78,
        manufacturer: "GasTech Pro",
        model: "GT-MQ4",
        serialNumber: "SN345678",
        firmwareVersion: "v1.5.0",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "4",
        name: "Gas Sensor D4",
        sensorId: "SENS-D4",
        type: "mq6",
        description: "MQ6 LPG gas sensor for propane detection",
        location: {
          id: "2",
          name: "Northside Emergency HQ",
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: "online",
        lastReading: {
          mq6: 0.8,
          temperature: 28.5,
          humidity: 38,
          timestamp: new Date().toISOString(),
          quality: "good"
        },
        thresholds: {
          mq6: { warning: 2, danger: 5, critical: 8 }
        },
        batteryLevel: 95,
        manufacturer: "SafeGas Systems",
        model: "SG-MQ6",
        serialNumber: "SN567890",
        firmwareVersion: "v2.1.0",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "5",
        name: "Gas Sensor E5",
        sensorId: "SENS-E5",
        type: "mq8",
        description: "MQ8 hydrogen gas sensor for leak detection",
        location: {
          id: "1",
          name: "Downtown Fire Station",
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        status: "warning",
        lastReading: {
          mq8: 4.2,
          temperature: 32.1,
          humidity: 48,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          quality: "warning"
        },
        thresholds: {
          mq8: { warning: 2, danger: 5, critical: 8 }
        },
        batteryLevel: 65,
        manufacturer: "HydroSafe Tech",
        model: "HS-MQ8",
        serialNumber: "SN789123",
        firmwareVersion: "v1.8.2",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString()
      }
    ];

    // Apply filters
    let filteredSensors = mockSensors;
    
    if (location) {
      filteredSensors = filteredSensors.filter(sensor => 
        sensor.location.name.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (status) {
      filteredSensors = filteredSensors.filter(sensor => sensor.status === status);
    }
    
    if (type) {
      filteredSensors = filteredSensors.filter(sensor => sensor.type === type);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSensors = filteredSensors.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedSensors,
      pagination: {
        page,
        limit,
        total: filteredSensors.length,
        pages: Math.ceil(filteredSensors.length / limit)
      },
      filters: {
        location,
        status,
        type
      }
    });

  } catch (error) {
    console.error('Get sensors error:', error);
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
