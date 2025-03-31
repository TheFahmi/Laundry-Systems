import { NextRequest, NextResponse } from 'next/server';

/**
 * Set a secure HTTP-only cookie in a NextResponse
 */
export const setCookie = (
  response: NextResponse,
  name: string, 
  value: string, 
  options: { 
    httpOnly?: boolean; 
    secure?: boolean; 
    sameSite?: 'strict' | 'lax' | 'none'; 
    path?: string; 
    maxAge?: number; 
    expires?: Date;
  } = {}
) => {
  // Default options for secure cookies
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day in seconds
  };
  
  // Merge with user options
  const cookieOptions = { ...defaultOptions, ...options };
  
  // Set the cookie
  response.cookies.set(name, value, cookieOptions);
  
  return response;
};

/**
 * Get a cookie value from a NextRequest
 */
export const getCookie = (
  request: NextRequest,
  name: string
): string | undefined => {
  return request.cookies.get(name)?.value;
};

/**
 * Delete a cookie from a NextResponse
 */
export const deleteCookie = (
  response: NextResponse,
  name: string
) => {
  response.cookies.delete(name);
  return response;
};

/**
 * Set JWT token as HTTP-only cookie in a NextResponse
 */
export const setAuthTokenCookie = (
  response: NextResponse,
  token: string, 
  maxAgeDays = 1
) => {
  return setCookie(response, 'token', token, {
    maxAge: 60 * 60 * 24 * maxAgeDays, // Convert days to seconds
  });
};

/**
 * Get auth token from a NextRequest
 */
export const getAuthTokenCookie = (
  request: NextRequest
): string | undefined => {
  return getCookie(request, 'token');
};

/**
 * Delete auth token from a NextResponse
 */
export const deleteAuthTokenCookie = (
  response: NextResponse
) => {
  return deleteCookie(response, 'token');
}; 