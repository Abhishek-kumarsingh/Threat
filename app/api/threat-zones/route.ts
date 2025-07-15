import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const threatLevel = searchParams.get('threatLevel');
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Gas pipeline threat zones
    const mockThreatZones = [
      {
        id: "1",
        name: "Downtown Pipeline Critical Zone",
        description: "High-risk area around gas pipeline intersection",
        location: {
          id: "1",
          name: "Downtown Fire Station",
          coordinates: { lat: 34.0522, lng: -118.2437 },
          address: "123 Main St, Los Angeles, CA"
        },
        threatLevel: 8.5,
        confidence: 0.92,
        isActive: true,
        type: "gas_leak_zone",
        severity: "critical",
        affectedArea: {
          radius: 500,
          shape: "circle",
          coordinates: [
            { lat: 34.0527, lng: -118.2442 },
            { lat: 34.0517, lng: -118.2432 },
            { lat: 34.0527, lng: -118.2432 },
            { lat: 34.0517, lng: -118.2442 }
          ]
        },
        zones: {
          extreme: { radius: 100, color: "#dc2626" },
          high: { radius: 200, color: "#ea580c" },
          moderate: { radius: 350, color: "#d97706" },
          low: { radius: 500, color: "#eab308" }
        },
        evacuationRoutes: [
          {
            id: "1",
            name: "North Exit Route",
            coordinates: [
              { lat: 34.0522, lng: -118.2437 },
              { lat: 34.0530, lng: -118.2440 },
              { lat: 34.0535, lng: -118.2445 }
            ],
            capacity: 1000,
            estimatedTime: "15 minutes"
          },
          {
            id: "2",
            name: "South Exit Route",
            coordinates: [
              { lat: 34.0522, lng: -118.2437 },
              { lat: 34.0515, lng: -118.2430 },
              { lat: 34.0510, lng: -118.2425 }
            ],
            capacity: 800,
            estimatedTime: "12 minutes"
          }
        ],
        sensors: [
          {
            id: "1",
            name: "Gas Sensor A1",
            status: "critical",
            lastReading: { mq2: 9.1, timestamp: new Date().toISOString() }
          },
          {
            id: "3",
            name: "Gas Sensor C3",
            status: "warning",
            lastReading: { mq4: 4.2, timestamp: new Date().toISOString() }
          }
        ],
        alerts: [
          {
            id: "1",
            title: "High Gas Concentration Detected",
            severity: "critical",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        ],
        emergencyServices: {
          contacted: true,
          responseTime: "8 minutes",
          unitsDispatched: 3
        },
        prediction: {
          algorithm: "ML_GAS_DISPERSION_V2",
          confidence: 0.92,
          factors: [
            "High gas concentration",
            "Wind direction: NE",
            "Temperature: 33.5°C",
            "Population density: High"
          ],
          nextUpdate: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "Northside Pipeline Monitoring Zone",
        description: "Moderate risk area with pressure anomalies",
        location: {
          id: "2",
          name: "Northside Emergency HQ",
          coordinates: { lat: 40.7128, lng: -74.0060 },
          address: "456 North Ave, New York, NY"
        },
        threatLevel: 4.2,
        confidence: 0.78,
        isActive: true,
        type: "pressure_anomaly_zone",
        severity: "warning",
        affectedArea: {
          radius: 200,
          shape: "circle",
          coordinates: [
            { lat: 40.7133, lng: -74.0065 },
            { lat: 40.7123, lng: -74.0055 },
            { lat: 40.7133, lng: -74.0055 },
            { lat: 40.7123, lng: -74.0065 }
          ]
        },
        zones: {
          extreme: { radius: 50, color: "#dc2626" },
          high: { radius: 100, color: "#ea580c" },
          moderate: { radius: 150, color: "#d97706" },
          low: { radius: 200, color: "#eab308" }
        },
        evacuationRoutes: [
          {
            id: "3",
            name: "East Exit Route",
            coordinates: [
              { lat: 40.7128, lng: -74.0060 },
              { lat: 40.7130, lng: -74.0055 },
              { lat: 40.7135, lng: -74.0050 }
            ],
            capacity: 500,
            estimatedTime: "10 minutes"
          }
        ],
        sensors: [
          {
            id: "2",
            name: "Gas Sensor B2",
            status: "offline",
            lastReading: { mq2: 2.1, timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
          }
        ],
        alerts: [
          {
            id: "2",
            title: "Pipeline Pressure Anomaly",
            severity: "warning",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ],
        emergencyServices: {
          contacted: false,
          responseTime: null,
          unitsDispatched: 0
        },
        prediction: {
          algorithm: "ML_PRESSURE_ANALYSIS_V1",
          confidence: 0.78,
          factors: [
            "Pressure fluctuations",
            "Sensor offline",
            "Historical patterns",
            "Weather conditions"
          ],
          nextUpdate: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Apply filters
    let filteredZones = mockThreatZones;

    if (status && status !== 'all') {
      if (status === 'active') {
        filteredZones = filteredZones.filter(zone => zone.isActive);
      } else if (status === 'inactive') {
        filteredZones = filteredZones.filter(zone => !zone.isActive);
      }
    }

    if (threatLevel && threatLevel !== 'all') {
      const level = parseFloat(threatLevel);
      filteredZones = filteredZones.filter(zone => zone.threatLevel >= level);
    }

    if (location && location !== 'all') {
      filteredZones = filteredZones.filter(zone => zone.location.id === location);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedZones = filteredZones.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
      total: filteredZones.length,
      active: filteredZones.filter(z => z.isActive).length,
      inactive: filteredZones.filter(z => !z.isActive).length,
      critical: filteredZones.filter(z => z.severity === 'critical').length,
      warning: filteredZones.filter(z => z.severity === 'warning').length,
      averageThreatLevel: filteredZones.reduce((sum, z) => sum + z.threatLevel, 0) / filteredZones.length || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        threatZones: paginatedZones,
        summary,
        pagination: {
          page,
          limit,
          total: filteredZones.length,
          pages: Math.ceil(filteredZones.length / limit)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Threat zones API error:', error);
    return NextResponse.json(
      { error: 'Failed to load threat zones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const zoneData = await request.json();
    
    // Mock creating a threat zone
    const newZone = {
      id: Date.now().toString(),
      ...zoneData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newZone,
      message: 'Threat zone created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create threat zone error:', error);
    return NextResponse.json(
      { error: 'Failed to create threat zone' },
      { status: 500 }
    );
  }
}
