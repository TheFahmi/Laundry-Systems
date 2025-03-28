import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export async function GET(request: NextRequest) {
  // Get token from cookies in the request
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.json({ 
      success: false, 
      message: 'No JWT token found in cookies',
      cookies: request.cookies.getAll().map(c => c.name)
    }, { status: 401 });
  }
  
  // Examine the token (don't verify signature, just decode)
  try {
    const decodedToken = jwtDecode(token);
    
    // Calculate token expiration
    const now = Math.floor(Date.now() / 1000);
    const exp = decodedToken.exp as number;
    const isExpired = exp < now;
    
    return NextResponse.json({
      success: true,
      message: 'JWT token found and decoded',
      token: {
        firstChars: token.substring(0, 15) + '...',
        lastChars: '...' + token.substring(token.length - 15),
        length: token.length
      },
      payload: {
        ...decodedToken,
        exp: decodedToken.exp,
        expiration: {
          timestamp: exp,
          date: new Date(exp * 1000).toISOString(),
          expired: isExpired,
          timeLeft: isExpired ? 'Expired' : `${Math.floor((exp - now) / 60)} minutes`
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to decode JWT token',
      error: error.message,
      token: {
        length: token.length,
        sample: token.substring(0, 20) + '...'
      }
    }, { status: 400 });
  }
} 