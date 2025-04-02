import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-here';

// Fungsi untuk decode token tanpa verifikasi
const decodeJWT = (token: string) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payloadB64 = parts[1];
    const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf8');
    return JSON.parse(payloadJson);
  } catch (error) {
    console.error('[JWT] Token decode error:', error);
    return null;
  }
};

// Fungsi untuk menghasilkan token baru
async function generateFreshToken(username: string, userId: string, role: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    // Buat token baru dengan masa berlaku 30 hari
    return await new SignJWT({
      username,
      sub: userId,
      role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d') // 30 hari
      .sign(secret);
  } catch (error) {
    console.error('[JWT] Token generation error:', error);
    return null;
  }
}

/**
 * GET handler to validate JWT token
 */
export async function GET(req: NextRequest) {
  try {
    // Dapatkan token dari cookie
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({
        valid: false,
        message: 'No token found'
      });
    }
    
    // Decode token untuk memeriksa expiration
    const payload = decodeJWT(token);
    if (!payload) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid token format'
      });
    }
    
    // Periksa apakah token expired
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;
    
    // Jika token masih valid, kembalikan sukses
    if (!isExpired) {
      return NextResponse.json({
        valid: true,
        username: payload.username,
        role: payload.role,
        message: 'Token is valid'
      });
    }
    
    // Jika token expired, buat token baru
    console.log('[Auth/Validate] Token expired, membuat token baru');
    
    // Pastikan payload memiliki data yang diperlukan
    if (!payload.username || !payload.sub || !payload.role) {
      return NextResponse.json({
        valid: false,
        message: 'Incomplete token payload'
      });
    }
    
    // Buat token baru
    const newToken = await generateFreshToken(
      payload.username,
      payload.sub,
      payload.role
    );
    
    if (!newToken) {
      return NextResponse.json({
        valid: false,
        message: 'Failed to generate new token'
      });
    }
    
    // Buat response dengan token baru
    const response = NextResponse.json({
      valid: true,
      renewed: true,
      username: payload.username,
      role: payload.role,
      message: 'Token has been renewed'
    });
    
    // Set cookie dengan token baru
    response.cookies.set({
      name: 'token',
      value: newToken,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 hari
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('[Auth/Validate] Error:', error);
    return NextResponse.json({
      valid: false,
      message: 'Error validating token'
    });
  }
} 