import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { User } from 'next-auth';

// Deklarasi type untuk user dengan properti tambahan
interface CustomUser extends User {
  role?: string;
  id: string;
}

// Konfigurator NextAuth
const handler = NextAuth({
  providers: [
    // Provider untuk login dengan email dan password
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password diperlukan');
        }

        try {
          // Dalam implementasi nyata, verifikasi dengan API backend
          // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     email: credentials.email,
          //     password: credentials.password,
          //   }),
          // });
          
          // const data = await response.json();
          
          // if (!response.ok) {
          //   throw new Error(data.message || 'Login gagal');
          // }
          
          // return data.user;

          // Untuk contoh/pengembangan, gunakan data statis
          if (credentials.email.includes('admin')) {
            return {
              id: '1',
              name: 'Admin User',
              email: credentials.email,
              role: 'admin'
            } as CustomUser;
          } else {
            return {
              id: '2',
              name: 'Customer User',
              email: credentials.email,
              role: 'customer'
            } as CustomUser;
          }
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Autentikasi gagal');
        }
      }
    }),
    
    // Provider untuk login dengan Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 hari
  },
  callbacks: {
    async jwt({ token, user }) {
      // Tambahkan data tambahan ke token
      if (user) {
        token.id = user.id;
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Kirim properti dari token ke sesi klien
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 