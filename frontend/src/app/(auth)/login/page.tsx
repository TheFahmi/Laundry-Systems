'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { APP_NAME } from '@/config';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

  // Check if user just registered or was logged out
  useEffect(() => {
    setMounted(true);
    
    // Check URL parameters for states
    const registered = searchParams?.get('registered');
    const expired = searchParams?.get('expired');
    
    if (registered === 'true') {
      setSuccessMessage('Registrasi berhasil! Silakan login dengan akun baru Anda.');
    } else if (expired === 'true') {
      setError('Sesi Anda telah berakhir. Silakan login kembali.');
    }
  }, [searchParams]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Username dan password harus diisi');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      // Direct login without getting CSRF token first
      const loginResult = await login(formData.username, formData.password);
      
      if (loginResult) {
        const callbackUrl = searchParams?.get('callbackUrl') || '/admin/dashboard';
        router.push(callbackUrl);
      } else {
        throw new Error('Login failed');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Sesi telah kedaluwarsa. Silakan muat ulang halaman dan coba lagi.');
      } else {
        setError(err.message || 'Login gagal. Periksa username dan password Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      remember: checked
    }));
  };
  
  // Simplified version for SSR
  if (!mounted) {
    return (
      <div className="container max-w-screen-lg mx-auto px-4">
        <div className="min-h-screen flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="p-4">
              <h1 className="text-3xl font-bold mb-2">{APP_NAME}</h1>
              <h2 className="text-xl text-muted-foreground">
                Sistem Manajemen Laundry Modern
              </h2>
            </div>
            <div>
              <Card>
                <CardHeader className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                    <Lock className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-screen-lg mx-auto px-4">
      <div className="min-h-screen flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="p-4">
            <h1 className="text-3xl font-bold mb-2">{APP_NAME}</h1>
            <h2 className="text-xl text-muted-foreground mb-4">
              Sistem Manajemen Laundry Modern
            </h2>
            <p className="text-muted-foreground mb-4">
              Kelola bisnis laundry Anda dengan lebih efisien. Lacak pesanan, 
              kelola pelanggan, dan monitor kinerja bisnis Anda dalam satu platform.
            </p>
          </div>
          
          <div>
            <Card>
              <CardHeader className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                  <Lock className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Login ke {APP_NAME}</CardTitle>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        placeholder="Masukkan username Anda"
                        autoComplete="username"
                        autoFocus
                        value={formData.username}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password Anda"
                          autoComplete="current-password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Sembunyikan password" : "Tampilkan password"}
                          </span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={formData.remember}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <Label htmlFor="remember" className="text-sm font-normal">
                        Ingat saya
                      </Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-center w-full">
                  <Link href="/register" className="text-primary hover:underline text-sm">
                    Belum punya akun? Daftar sekarang
                  </Link>
                </div>
                
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <Link href="/lupa-password" className="hover:underline">
                    Lupa password?
                  </Link>
                  <span>|</span>
                  <Link href="/" className="hover:underline">
                    Kembali ke beranda
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 