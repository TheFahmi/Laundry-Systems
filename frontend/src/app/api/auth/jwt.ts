import jwt from 'jsonwebtoken';

// In a real application, this should be set as an environment variable
// and kept secret - never hardcoded like this
const JWT_SECRET = process.env.JWT_SECRET || 'laundry-app-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '24h'; // Token expires in 24 hours

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Parse a JWT token from an Authorization header
 */
export function parseAuthHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
} 