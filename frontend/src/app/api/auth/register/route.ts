import { NextRequest, NextResponse } from 'next/server';
import { userService, User } from '../users';

// Add base URL 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    console.log('Registration API route called');
    
    // Extract the CSRF token from the request headers
    const csrfToken = request.headers.get('x-csrf-token');
    
    const body = await request.json();
    console.log('Received registration data:', body);
    
    const { username, password, email, name, role = 'staff' } = body;

    // Validasi input
    if (!username || !password || !email || !name) {
      console.log('Missing required fields:', { username: !!username, password: !!password, email: !!email, name: !!name });
      return NextResponse.json(
        { message: 'Username, password, email, dan nama diperlukan' },
        { status: 400 }
      );
    }

    try {
      // Forward the request to the backend
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        body: JSON.stringify(body),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error(`Registration failed (${response.status}):`, errorData);
        
        return NextResponse.json({ 
          message: errorData.message || 'Registration failed', 
        }, { status: response.status });
      }

      // Get response data from backend
      const data = await response.json();
      console.log('Registration successful via backend');
      
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error during backend registration:', error);
      
      // Fallback to local mock registration if backend is unavailable
      console.log('Falling back to local registration');
      
      // Cek apakah username atau email sudah digunakan
      const existingUser = userService.userExists(username, email);

      if (existingUser) {
        return NextResponse.json(
          { message: 'Username atau email sudah digunakan' },
          { status: 409 }
        );
      }

      // Buat user baru (dalam implementasi nyata, simpan ke database)
      const newUser: User = {
        id: String(userService.getUserCount() + 1),
        username,
        password,
        email,
        name,
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Tambahkan user ke array (simulasi penyimpanan)
      userService.addUser(newUser);
      console.log('User created successfully (local fallback):', { id: newUser.id, username: newUser.username });
      console.log('Updated users:', userService.getUsers().map(u => u.username));

      // Hapus password dari respons
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;

      // Format respons yang sama dengan backend
      return NextResponse.json(userWithoutPassword);
    }
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
} 