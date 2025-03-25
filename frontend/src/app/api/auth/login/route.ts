import { NextRequest, NextResponse } from 'next/server';

// Mock users for testing
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    name: 'Admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'staff',
    password: 'staff123',
    email: 'staff@example.com',
    name: 'Staff User',
    role: 'staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password diperlukan' },
        { status: 400 }
      );
    }

    // Check if the user exists and password matches
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Don't include password in the response
    const { password: _, ...userWithoutPassword } = user;

    // Return successful response with user data and token
    return NextResponse.json({
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
} 