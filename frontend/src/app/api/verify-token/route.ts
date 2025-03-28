import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export async function GET(request: NextRequest) {
  // Get token from cookies in the request
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.json({ 
      valid: false,
      error: 'No token found in cookies'
    });
  }
  
  try {
    // First check if token can be decoded
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.exp as number || 0;
    
    if (exp < now) {
      return NextResponse.json({
        valid: false,
        error: 'Token is expired',
        expiry: new Date(exp * 1000).toISOString(),
        now: new Date(now * 1000).toISOString()
      });
    }
    
    // Now actually verify the token with the backend
    console.log('Verifying token with backend...');
    const response = await fetch('http://localhost:3001/auth/validate', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      // Get response body text
      const responseText = await response.text();
      
      return NextResponse.json({
        valid: false,
        error: `Backend validation failed: ${response.status}`,
        details: responseText
      });
    }
    
    const data = await response.json();
    return NextResponse.json({
      valid: true,
      message: 'Token is valid',
      backendResponse: data
    });
  } catch (error: any) {
    return NextResponse.json({
      valid: false,
      error: error.message || 'Error validating token'
    });
  }
} 