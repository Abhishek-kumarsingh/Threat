import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Connect to database when threat zone models are implemented
    // await connectDB();

    // For now, return mock data since we don't have threat zone models yet
    // TODO: Replace with actual database queries when threat zone models are implemented
    const mockActiveThreatZones = [
      {
        id: 1,
        name: "High Risk Zone Alpha",
        severity: "high",
        threatLevel: 8.5,
        location: {
          id: 1,
          name: "Building A - Floor 1"
        },
        boundaries: {
          type: "polygon",
          coordinates: [
            [40.7128, -74.0060],
            [40.7130, -74.0058],
            [40.7132, -74.0062],
            [40.7128, -74.0060]
          ]
        },
        estimatedPopulation: 150,
        status: "active",
        evacuationRoutes: [
          {
            id: "route-1",
            name: "Emergency Exit Route A",
            description: "Primary evacuation route via main stairwell",
            estimatedTime: "5-8 minutes",
            capacity: 200
          },
          {
            id: "route-2",
            name: "Emergency Exit Route B",
            description: "Secondary evacuation route via fire escape",
            estimatedTime: "8-12 minutes",
            capacity: 100
          }
        ],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours from now
      },
      {
        id: 2,
        name: "Medium Risk Zone Beta",
        severity: "medium",
        threatLevel: 5.2,
        location: {
          id: 2,
          name: "Building B - Floor 2"
        },
        boundaries: {
          type: "polygon",
          coordinates: [
            [40.7140, -74.0070],
            [40.7142, -74.0068],
            [40.7144, -74.0072],
            [40.7140, -74.0070]
          ]
        },
        estimatedPopulation: 75,
        status: "active",
        evacuationRoutes: [
          {
            id: "route-3",
            name: "Emergency Exit Route C",
            description: "Main evacuation route via central corridor",
            estimatedTime: "3-5 minutes",
            capacity: 150
          }
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours from now
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockActiveThreatZones,
      count: mockActiveThreatZones.length
    });

  } catch (error) {
    console.error('Get active threat zones error:', error);
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
