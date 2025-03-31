'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { APP_NAME } from '@/config';
import { Eye, EyeOff, User, ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Interface untuk data form
interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'staff' | 'manager';
}

const steps = ['Buat Akun', 'Informasi Kontak', 'Selesai'];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  
  // State untuk mengetahui apakah komponen sudah di-mount
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'staff'
  });
  
  // Efek untuk menandai bahwa komponen sudah di-mount di sisi klien
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle perubahan input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle langkah selanjutnya
  const handleNext = () => {
    if (activeStep === 0) {
      // Validasi langkah 1 (username dan password)
      if (!formData.username || !formData.password) {
        setError('Username dan password harus diisi');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter');
        return;
      }
    } else if (activeStep === 1) {
      // Validasi langkah 2 (email dan nama)
      if (!formData.email || !formData.name) {
        setError('Email dan nama lengkap harus diisi');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Format email tidak valid');
        return;
      }
    }
    
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle langkah sebelumnya
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { username, password, email, name } = formData;

      if (!username || !email || !password || !name) {
        throw new Error('Semua field harus diisi: username, email, password, dan nama');
      }

      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Format email tidak valid');
      }

      const success = await register(username, password, email, name);
      if (success) {
        // Show success message before redirecting
        setActiveStep(2); // Move to "success" step if you have one
        
        // Redirect to login page after a slight delay
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 1500);
      } else {
        throw new Error('Registrasi gagal. Silakan coba lagi.');
      }
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
      setActiveStep(0); // Return to first step on error
    } finally {
      setLoading(false);
    }
  };
  
  // Jika belum dimount (masih di server), tampilkan layout minimal
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
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <CardTitle>Daftar</CardTitle>
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
              Bergabunglah dengan platform manajemen laundry terbaik. 
              Kelola bisnis Anda dengan lebih efisien dan profesional.
            </p>
          </div>
          
          <div>
            <Card>
              <CardHeader className="text-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                  <User className="h-5 w-5 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Daftar ke {APP_NAME}</CardTitle>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="mb-8">
                  <div className="flex justify-between relative">
                    {steps.map((label, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                          ${activeStep > index ? 'bg-primary text-primary-foreground' : 
                            activeStep === index ? 'bg-primary text-primary-foreground' : 
                            'bg-muted text-muted-foreground'}
                        `}>
                          {activeStep > index ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="text-xs mt-1">{label}</div>
                      </div>
                    ))}
                    <div className="absolute top-4 left-0 right-0 h-[2px] -z-10 bg-muted">
                      <div 
                        className="h-full bg-primary" 
                        style={{ 
                          width: `${activeStep * 50}%`,
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>
                  </div>
                </div>
                
                <form onSubmit={activeStep === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                  {/* Langkah 1: Akun */}
                  {activeStep === 0 && (
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
                            autoComplete="new-password"
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
                        <p className="text-xs text-muted-foreground">
                          Password minimal 6 karakter
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Langkah 2: Informasi Pribadi */}
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Masukkan nama lengkap Anda"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Masukkan email Anda"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Langkah 3: Konfirmasi */}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium mb-2">Ringkasan Informasi</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Username:</div>
                          <div>{formData.username}</div>
                          <div className="text-muted-foreground">Nama:</div>
                          <div>{formData.name}</div>
                          <div className="text-muted-foreground">Email:</div>
                          <div>{formData.email}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={activeStep === 0 || loading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </Button>

                    <Button
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                          <span>Memproses...</span>
                        </>
                      ) : activeStep === steps.length - 1 ? (
                        "Daftar"
                      ) : (
                        <>
                          Lanjut
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex justify-center">
                <div className="text-sm text-muted-foreground">
                  Sudah punya akun? {' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Login
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