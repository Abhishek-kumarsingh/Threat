import { NextRequest, NextResponse } from 'next/server';

// Mock user storage (in real app, this would be a database)
let mockUsers = [
  {
    id: '1',
    email: 'admin@threatguard.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin']
  },
  {
    id: '2',
    email: 'operator@threatguard.com',
    password: 'operator123',
    name: 'Operator User',
    role: 'operator',
    permissions: ['read', 'write']
  },
  {
    id: '3',
    email: 'user@threatguard.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user',
    permissions: ['read']
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'user' } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      email,
      password, // In real app, hash this password
      name,
      role,
      permissions: role === 'admin' ? ['read', 'write', 'delete', 'admin'] : 
                   role === 'operator' ? ['read', 'write'] : ['read']
    };

    // Add to mock storage
    mockUsers.push(newUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
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
