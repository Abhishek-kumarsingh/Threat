import { NextRequest, NextResponse } from 'next/server';

// Mock user data
const mockUsers = [
  {
    id: '1',
    email: 'admin@threatguard.com',
    name: 'Admin User',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin']
  },
  {
    id: '2',
    email: 'operator@threatguard.com',
    name: 'Operator User',
    role: 'operator',
    permissions: ['read', 'write']
  },
  {
    id: '3',
    email: 'user@threatguard.com',
    name: 'Regular User',
    role: 'user',
    permissions: ['read']
  }
];

function verifyRefreshToken(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (payload.exp < Date.now()) {
      return null;
    }
    
    // Check if it's a refresh token
    if (payload.type !== 'refresh') {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

function generateMockToken(user: any) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Find user
    const user = mockUsers.find(u => u.id === payload.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new access token
    const newToken = generateMockToken(user);

    return NextResponse.json({
      success: true,
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
