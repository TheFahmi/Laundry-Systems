import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper untuk memverifikasi token JWT dan mengekstrak payload
const verifyJWT = async (token: string) => {
  try {
    // Secret key harus sama dengan yang digunakan di backend
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-here');
    const { payload } = await jwtVerify(token, secret, {
      // Abaikan expiration untuk mendapatkan payload
      clockTolerance: 60 * 60 * 24 // 1 hari toleransi
    });
    return payload;
  } catch (error) {
    console.error('[JWT] Verifikasi token gagal:', error);
    return null;
  }
};

// Helper untuk membuat token baru dengan waktu kadaluarsa lebih lama
const createNewToken = async (payload: any) => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-here');
    
    // Buat token baru dengan waktu kadaluarsa yang lebih lama
    const newToken = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // 24 jam
      .sign(secret);
    
    return newToken;
  } catch (error) {
    console.error('[JWT] Pembuatan token baru gagal:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  console.log('[API Route] /api/orders: GET request received');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('[API Route] /api/orders: No token available for GET');
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    console.log('[API Route] /api/orders: Query params:', queryParams);
    
    // Coba kirim request ke backend
    console.log('[API Route] /api/orders: Forwarding request to backend');
    const response = await fetch(`${API_BASE_URL}/orders${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Jika sukses, langsung kembalikan datanya
    if (response.ok) {
      const data = await response.json();
      console.log('[API Route] /api/orders: Response received from backend');
      return NextResponse.json(data);
    }
    
    // Jika token expired (401), coba refresh token
    if (response.status === 401) {
      console.log('[API Route] /api/orders: Token mungkin expired, mencoba refresh token');
      
      // Ekstrak payload dari token lama
      const payload = await verifyJWT(token);
      
      if (!payload) {
        console.log('[API Route] /api/orders: Tidak bisa mendapatkan payload dari token');
        return NextResponse.json({ 
          error: 'Authentication failed',
          message: 'Invalid token. Please log in again.'
        }, { status: 401 });
      }
      
      // Buat token baru dengan payload yang sama tapi expiry lebih lama
      const newToken = await createNewToken(payload);
      
      if (!newToken) {
        console.log('[API Route] /api/orders: Gagal membuat token baru');
        return NextResponse.json({ 
          error: 'Authentication failed',
          message: 'Failed to refresh token. Please log in again.'
        }, { status: 401 });
      }
      
      // Coba lagi request dengan token baru
      console.log('[API Route] /api/orders: Mencoba ulang dengan token baru');
      const retryResponse = await fetch(`${API_BASE_URL}/orders${queryParams ? `?${queryParams}` : ''}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Jika berhasil, kembalikan data dan token baru
      if (retryResponse.ok) {
        const data = await retryResponse.json();
        
        // Buat response dengan data dan set cookie baru
        const response = NextResponse.json({
          ...data,
          _tokenRefreshed: true
        });
        
        // Set cookie baru dengan token baru
        response.cookies.set({
          name: 'token',
          value: newToken,
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24, // 24 jam
          sameSite: 'strict'
        });
        
        console.log('[API Route] /api/orders: Token berhasil di-refresh');
        return response;
      }
      
      // Jika tetap gagal, kembalikan error
      const retryErrorData = await retryResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders: Retry failed (${retryResponse.status}):`, retryErrorData);
      
      return NextResponse.json({ 
        error: 'Authentication failed',
        message: 'Failed to refresh token. Please log in again.',
        details: retryErrorData
      }, { status: retryResponse.status });
    }
    
    // Untuk error lainnya
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error(`[API Route] /api/orders: GET failed (${response.status}):`, errorData);
    
    return NextResponse.json({ 
      error: 'Failed to fetch orders',
      message: errorData.message || 'Unknown error'
    }, { status: response.status });
  } catch (error: any) {
    console.error('[API Route] /api/orders: Exception:', error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch orders',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('[API Route] /api/orders: POST request received');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('[API Route] /api/orders: No token available for POST');
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward request to backend
    console.log('[API Route] /api/orders: Forwarding POST request to backend');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    // Jika sukses, langsung kembalikan datanya
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        statusCode: 201,
        message: 'Order created successfully',
        timestamp: new Date().toISOString(),
        data: data
      });
    }
    
    // Jika token expired (401), coba refresh token
    if (response.status === 401) {
      console.log('[API Route] /api/orders: Token mungkin expired dalam POST, mencoba refresh token');
      
      // Ekstrak payload dari token lama
      const payload = await verifyJWT(token);
      
      if (!payload) {
        console.log('[API Route] /api/orders: Tidak bisa mendapatkan payload dari token');
        return NextResponse.json({ 
          error: 'Authentication failed',
          message: 'Invalid token. Please log in again.'
        }, { status: 401 });
      }
      
      // Buat token baru dengan payload yang sama tapi expiry lebih lama
      const newToken = await createNewToken(payload);
      
      if (!newToken) {
        console.log('[API Route] /api/orders: Gagal membuat token baru untuk POST');
        return NextResponse.json({ 
          error: 'Authentication failed',
          message: 'Failed to refresh token. Please log in again.'
        }, { status: 401 });
      }
      
      // Coba lagi request dengan token baru
      console.log('[API Route] /api/orders: Mencoba ulang POST dengan token baru');
      const retryResponse = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      // Jika berhasil, kembalikan data dan token baru
      if (retryResponse.ok) {
        const data = await retryResponse.json();
        
        // Buat response dengan data dan set cookie baru
        const response = NextResponse.json({
          statusCode: 201,
          message: 'Order created successfully',
          timestamp: new Date().toISOString(),
          data: data,
          _tokenRefreshed: true
        });
        
        // Set cookie baru dengan token baru
        response.cookies.set({
          name: 'token',
          value: newToken,
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24, // 24 jam
          sameSite: 'strict'
        });
        
        console.log('[API Route] /api/orders: Token berhasil di-refresh dalam POST');
        return response;
      }
      
      // Jika tetap gagal, kembalikan error
      const retryErrorData = await retryResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders: POST retry failed (${retryResponse.status}):`, retryErrorData);
      
      return NextResponse.json({ 
        error: 'Authentication failed',
        message: 'Failed to refresh token. Please log in again.',
        details: retryErrorData
      }, { status: retryResponse.status });
    }
    
    // Untuk error lainnya
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error(`[API Route] /api/orders: POST failed (${response.status}):`, errorData);
    
    return NextResponse.json({ 
      error: 'Failed to create order',
      message: errorData.message || 'Unknown error',
      details: errorData
    }, { status: response.status });
  } catch (error: any) {
    console.error('[API Route] /api/orders: POST exception:', error.message);
    return NextResponse.json({ 
      error: 'Failed to create order',
      message: error.message
    }, { status: 500 });
  }
} 