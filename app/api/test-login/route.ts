import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/lib/models/User';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing login process...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');

    const body = await request.json();
    const { email, password } = body;
    console.log('📧 Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    console.log('🔍 Looking for user in database...');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', { email: user.email, role: user.role, isActive: user.isActive });

    if (!user.isActive) {
      console.log('❌ User account is inactive');
      return NextResponse.json(
        { error: 'User account is inactive' },
        { status: 401 }
      );
    }

    // Check password
    console.log('🔐 Checking password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate tokens
    console.log('🎫 Generating tokens...');
    try {
      const token = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role
      });

      const refreshToken = generateRefreshToken(user._id.toString());
      console.log('✅ Tokens generated successfully');

      // Update last login
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ Last login updated');

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        refreshToken,
        user: user.toJSON()
      });

    } catch (tokenError) {
      console.error('❌ Token generation failed:', tokenError);
      return NextResponse.json(
        { error: 'Token generation failed: ' + (tokenError instanceof Error ? tokenError.message : 'Unknown error') },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Login test error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
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
