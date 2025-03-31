import { NextRequest, NextResponse } from 'next/server';

/**
 * POST handler for login requests
 */
export async function POST(req: NextRequest) {
  console.log('[API] Login request received');
  
  try {
    // Get API URL from environment variable with fallback
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Extract login data from the request
    const loginData = await req.json();
    console.log('[API] Login attempt for user:', loginData.username);
    
    // Create a new request to the backend
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(loginData)
    });
    
    // Get the response data
    const responseData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('[API] Login failed with status:', loginResponse.status);
      return NextResponse.json(responseData, {
        status: loginResponse.status
      });
    }
    
    // Create the Next.js response
    const response = NextResponse.json(responseData, {
      status: 200
    });
    
    // If login was successful and we have a token, set our own cookie with 14-day expiry
    if (responseData.token) {
      // Calculate expiry date - 14 days from now
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 14);
      
      console.log('[API] Setting token cookie with 14-day expiry');
      
      // Set the token cookie with 14-day expiry
      response.cookies.set({
        name: 'token',
        value: responseData.token,
        expires: expiryDate,
        path: '/',
        httpOnly: false, // Allow JavaScript access
        sameSite: 'lax'
      });
      
      // Also send a non-HttpOnly copy for js-cookie to access
      response.cookies.set({
        name: 'js_token',
        value: responseData.token,
        expires: expiryDate,
        path: '/',
        httpOnly: false,
        sameSite: 'lax'
      });
      
      console.log('[API] Token cookies set successfully');
    } else {
      console.log('[API] No token in response, unable to set cookies');
    }
    
    // Still forward any cookies from the backend
    const backendCookies = loginResponse.headers.getSetCookie();
    if (backendCookies && backendCookies.length) {
      backendCookies.forEach(cookie => {
        // Only add cookies that aren't the token we already set
        if (!cookie.startsWith('token=')) {
          response.headers.append('Set-Cookie', cookie);
        }
      });
    }
    
    return response;
  } catch (error) {
    console.error('[API] Login error:', error);
    return NextResponse.json(
      { message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
} 