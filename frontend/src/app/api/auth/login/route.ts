import { NextRequest, NextResponse } from 'next/server';
import { userService } from '../users';
import { generateToken } from '../jwt';

// Add base URL 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    console.log('Login API route called');
    
    // Extract the CSRF token from the request headers
    const csrfToken = request.headers.get('x-csrf-token');
    
    // Get request body
    const body = await request.json();
    console.log('Login data:', { username: body.username, password: '***' });

    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password diperlukan' },
        { status: 400 }
      );
    }

    try {
      // Forward the request to the backend using fetch
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        body: JSON.stringify({ username, password }),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error(`Login failed (${response.status}):`, errorData);
        
        return NextResponse.json({ 
          success: false, 
          message: errorData.message || 'Login gagal', 
        }, { status: response.status });
      }

      // Get response data from backend
      const data = await response.json();
      console.log('Login successful via backend');
      
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error during backend login:', error);
      
      // Fallback to local mock authentication if backend is unavailable
      console.log('Falling back to local authentication');
      
      // Check if the user exists and password matches using userService
      const user = userService.findUser(username, password);

      if (!user) {
        console.log(`Login failed for username: ${username}`);
        const availableUsers = userService.getUsers().map(u => u.username);
        console.log('Available users:', availableUsers);
        return NextResponse.json(
          { success: false, message: 'Username atau password salah' },
          { status: 401 }
        );
      }

      console.log(`Login successful for user: ${username} (local fallback)`);

      // Generate JWT token with user information
      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role
      });

      // Don't include password in the response
      const { password: _, ...userWithoutPassword } = user;

      // Return successful response with user data and token
      return NextResponse.json({
        user: userWithoutPassword,
        token,
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
} 