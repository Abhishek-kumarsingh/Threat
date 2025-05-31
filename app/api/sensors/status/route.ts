import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Connect to database when sensor models are implemented
    // await connectDB();

    // For now, return mock data since we don't have sensor models yet
    // TODO: Replace with actual database queries when sensor models are implemented
    const mockSensorStatus = {
      total: 50,
      active: 45,
      inactive: 3,
      error: 2,
      lowBattery: 5,
      byType: {
        temperature: 20,
        humidity: 15,
        air_quality: 10,
        motion: 5
      },
      recentAlerts: 3,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockSensorStatus
    });

  } catch (error) {
    console.error('Get sensor status error:', error);
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
