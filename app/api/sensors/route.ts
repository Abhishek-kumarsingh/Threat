import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock sensor data
    const mockSensors = [
      {
        id: "1",
        name: "Temperature Sensor 1",
        type: "temperature",
        description: "Main lobby temperature monitoring",
        location: {
          id: "1",
          name: "Building A - Floor 1",
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: "active",
        lastReading: {
          value: 22.5,
          unit: "°C",
          timestamp: new Date().toISOString(),
          quality: "good"
        },
        thresholds: {
          min: 18,
          max: 25,
          critical_min: 15,
          critical_max: 30
        },
        batteryLevel: 85,
        configuration: {
          readingInterval: 300,
          transmissionInterval: 600,
          calibrationOffset: 0.5
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "Humidity Sensor 1",
        type: "humidity",
        description: "Main lobby humidity monitoring",
        location: {
          id: "1",
          name: "Building A - Floor 1",
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: "active",
        lastReading: {
          value: 45.2,
          unit: "%",
          timestamp: new Date().toISOString(),
          quality: "good"
        },
        thresholds: {
          min: 30,
          max: 70,
          critical_min: 20,
          critical_max: 80
        },
        batteryLevel: 92,
        configuration: {
          readingInterval: 300,
          transmissionInterval: 600,
          calibrationOffset: 0.0
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "3",
        name: "Air Quality Sensor 1",
        type: "air_quality",
        description: "Conference room air quality monitoring",
        location: {
          id: "2",
          name: "Building A - Floor 2",
          coordinates: { lat: 40.7130, lng: -74.0058 }
        },
        status: "active",
        lastReading: {
          value: 35,
          unit: "AQI",
          timestamp: new Date().toISOString(),
          quality: "good"
        },
        thresholds: {
          min: 0,
          max: 50,
          critical_min: 0,
          critical_max: 100
        },
        batteryLevel: 78,
        configuration: {
          readingInterval: 600,
          transmissionInterval: 1200,
          calibrationOffset: 0.0
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "4",
        name: "Motion Sensor 1",
        type: "motion",
        description: "Entrance motion detection",
        location: {
          id: "3",
          name: "Building A - Entrance",
          coordinates: { lat: 40.7125, lng: -74.0062 }
        },
        status: "inactive",
        lastReading: {
          value: 0,
          unit: "detected",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          quality: "good"
        },
        thresholds: {
          min: 0,
          max: 1,
          critical_min: 0,
          critical_max: 1
        },
        batteryLevel: 15,
        configuration: {
          readingInterval: 60,
          transmissionInterval: 300,
          calibrationOffset: 0.0
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: "5",
        name: "Temperature Sensor 2",
        type: "temperature",
        description: "Server room temperature monitoring",
        location: {
          id: "4",
          name: "Building B - Server Room",
          coordinates: { lat: 40.7140, lng: -74.0070 }
        },
        status: "error",
        lastReading: {
          value: 28.9,
          unit: "°C",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          quality: "poor"
        },
        thresholds: {
          min: 18,
          max: 24,
          critical_min: 15,
          critical_max: 27
        },
        batteryLevel: 65,
        configuration: {
          readingInterval: 120,
          transmissionInterval: 300,
          calibrationOffset: 0.0
        },
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
