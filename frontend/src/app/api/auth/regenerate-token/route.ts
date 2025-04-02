import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-here';

export async function POST(request: NextRequest) {
  console.log('[API Route] /api/auth/regenerate-token: POST request received');
  
  try {
    // Parse request body
    const body = await request.json();
    const { username, userId, role } = body;
    
    // Validate required fields
    if (!username || !userId) {
      console.log('[API Route] Missing required fields for token regeneration');
      return NextResponse.json(
        { error: 'Missing required user information' }, 
        { status: 400 }
      );
    }
    
    console.log(`[API Route] Regenerating token for user: ${username}, role: ${role || 'user'}`);
    
    // Create new JWT token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      username,
      userId,
      role: role || 'user'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d') // 30 days expiration
      .sign(secret);
    
    // Set token in cookies and return it in response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Token regenerated successfully',
      token
    });
    
    // Set HTTP cookie (more secure)
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    console.log('[API Route] Token regenerated and set in cookies');
    
    return response;
  } catch (error: any) {
    console.error('[API Route] Error regenerating token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to regenerate token', 
        message: error.message 
      }, 
      { status: 500 }
    );
  }
} 