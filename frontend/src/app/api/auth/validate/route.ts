import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Menggunakan NextRequest headers yang lebih stabil
    const authorization = request.headers.get('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid' },
        { status: 401 }
      );
    }
    
    const token = authorization.split(' ')[1];
    
    // Dalam implementasi nyata, lakukan validasi token dengan JWT
    // Di sini kita hanya memeriksa apakah token dimulai dengan 'mock-jwt-token-'
    if (!token || !token.startsWith('mock-jwt-token-')) {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Token valid'
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat validasi token' },
      { status: 500 }
    );
  }
} 