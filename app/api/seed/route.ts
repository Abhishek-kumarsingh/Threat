import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/lib/models/User';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const seedUsers = [
  {
    email: 'admin@threatguard.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    isActive: true
  },
  {
    email: 'operator@threatguard.com',
    password: 'operator123',
    name: 'Operator User',
    role: 'operator',
    isActive: true
  },
  {
    email: 'user@threatguard.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user',
    isActive: true
  }
];

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});

    console.log('🔐 Creating demo users...');

    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push({
        email: user.email,
        name: user.name,
        role: user.role
      });
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      users: createdUsers,
      credentials: {
        admin: 'admin@threatguard.com / admin123',
        operator: 'operator@threatguard.com / operator123',
        user: 'user@threatguard.com / user123'
      }
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
