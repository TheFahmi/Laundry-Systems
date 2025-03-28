import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the token from the request body
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'No token provided in request body' 
      }, { status: 400 });
    }
    
    // Set the cookie with the token
    const response = NextResponse.json({
      success: true,
      message: 'Token cookie set successfully'
    });
    
    // Set cookie in the response
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax'
    });
    
    return response;
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `Error setting token cookie: ${error.message}`,
    }, { status: 500 });
  }
} 