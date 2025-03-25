import { NextRequest, NextResponse } from 'next/server';

// Data pengguna untuk implementasi sementara
const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email, name, role = 'staff' } = body;

    // Validasi input
    if (!username || !password || !email || !name) {
      return NextResponse.json(
        { message: 'Username, password, email, dan nama diperlukan' },
        { status: 400 }
      );
    }

    // Cek apakah username atau email sudah digunakan
    const existingUser = users.find(
      (u) => u.username === username || u.email === email
    );

    if (existingUser) {
      return NextResponse.json(
        { message: 'Username atau email sudah digunakan' },
        { status: 409 }
      );
    }

    // Buat user baru (dalam implementasi nyata, simpan ke database)
    const newUser = {
      id: String(users.length + 1),
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
    users.push(newUser);

    // Hapus password dari respons
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;

    // Format respons yang sama dengan backend
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
} 