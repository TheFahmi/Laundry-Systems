'use server';

import { cookies } from 'next/headers';

/**
 * Set a secure HTTP-only cookie with server component
 */
export const setServerCookie = (
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
  cookies().set(name, value, cookieOptions);
};

/**
 * Get a cookie value from server component
 */
export const getServerCookie = (name: string): string | undefined => {
  return cookies().get(name)?.value;
};

/**
 * Delete a cookie from server component
 */
export const deleteServerCookie = (name: string) => {
  cookies().delete(name);
};

/**
 * Set JWT token as HTTP-only cookie from server component
 */
export const setAuthToken = (token: string, maxAgeDays = 1) => {
  setServerCookie('token', token, {
    maxAge: 60 * 60 * 24 * maxAgeDays, // Convert days to seconds
  });
};

/**
 * Get auth token from server component
 */
export const getAuthToken = (): string | undefined => {
  return getServerCookie('token');
};

/**
 * Delete auth token from server component
 */
export const deleteAuthToken = () => {
  deleteServerCookie('token');
}; 