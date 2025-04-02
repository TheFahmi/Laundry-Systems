'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { APP_NAME } from '@/config';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Truck, 
  Search, 
  Package, 
  CheckCircle, 
  ShieldCheck,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define the FeatureCard props interface
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneLastDigits, setPhoneLastDigits] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect ke /dashboard jika sudah login
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!orderNumber) {
      setError('Masukkan nomor order');
      return;
    }
    
    if (!phoneLastDigits || phoneLastDigits.length !== 4 || !/^\d+$/.test(phoneLastDigits)) {
      setError('Masukkan 4 digit terakhir nomor HP');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // In a real app, you would make an API call here to verify the order number and phone digits
      // For now, we'll simulate a successful verification
      setTimeout(() => {
        // Redirect to order tracking page
        router.push(`/track-order/${orderNumber}?verify=${phoneLastDigits}`);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Verifikasi gagal. Periksa kembali nomor order dan nomor HP Anda.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">{APP_NAME}</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6 items-center">
            <ModeToggle />
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Masuk
            </Button>
            <Button 
              onClick={() => router.push('/register')}
              className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600"
            >
              Daftar
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full mb-2">
                  #1 Laundry Management System
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                  {APP_NAME}
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Solusi lengkap untuk bisnis laundry Anda. Kelola pelanggan, pesanan, 
                  dan pembayaran dengan mudah serta pantau bisnis Anda secara real-time.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-4">
                <Button 
                  size="lg" 
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                >
                  Mulai Sekarang
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/register')}>
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:w-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-3xl -z-10"></div>
              <Card className="overflow-hidden border-none shadow-xl">
                <Image
                  src="/assets/laundry-hero.jpg"
                  alt="Laundry Management System"
                  width={600}
                  height={400}
                  className="aspect-video w-full object-cover"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Order tracking section */}
      <section className="w-full py-16" id="track-order">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <Card className="shadow-lg border-none overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-4">
                  <CardTitle className="text-xl flex items-center text-indigo-800">
                    <Package className="mr-2 h-5 w-5 text-indigo-600" />
                    Lacak Pesanan Anda
                  </CardTitle>
                  <CardDescription>
                    Masukkan nomor order dan 4 digit terakhir nomor HP Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleTrackOrder} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="order-number" className="text-gray-700">Nomor Order</Label>
                      <div className="relative">
                        <Input
                          id="order-number"
                          placeholder="Contoh: WO-2025-001"
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value)}
                          className="pl-10 bg-gray-50"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                          <Package className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone-digits" className="text-gray-700">4 Digit Terakhir Nomor HP</Label>
                      <div className="relative">
                        <Input
                          id="phone-digits"
                          placeholder="Contoh: 1234"
                          maxLength={4}
                          value={phoneLastDigits}
                          onChange={(e) => setPhoneLastDigits(e.target.value.replace(/\D/g, ''))}
                          className="pl-10 bg-gray-50"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                          <span className="font-mono font-medium">0XXX</span>
                        </div>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="rounded-md bg-red-50 p-3">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Memverifikasi...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Lacak Pesanan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="inline-block bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full mb-2">
                Tracking Cepat
              </div>
              <h2 className="text-3xl font-bold mb-4">Lacak Status Pesanan Anda</h2>
              <p className="text-gray-600 mb-6">
                Pantau status pesanan laundry Anda secara real-time. Masukkan nomor order dan verifikasi dengan 4 digit terakhir nomor HP Anda.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Masukkan Nomor Order</h4>
                    <p className="text-gray-500 text-sm">
                      Cek nomor order pada struk atau SMS konfirmasi Anda
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Verifikasi dengan 4 Digit Nomor HP</h4>
                    <p className="text-gray-500 text-sm">
                      Untuk keamanan, masukkan 4 digit terakhir nomor HP Anda
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Lihat Status Pesanan Real-time</h4>
                    <p className="text-gray-500 text-sm">
                      Pantau status pesanan dari penerimaan hingga pengiriman
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
              Fitur Unggulan
            </div>
            <h2 className="text-3xl font-bold">Solusi Lengkap untuk Bisnis Laundry</h2>
            <p className="max-w-[800px] text-gray-600 md:text-lg">
              Semua yang Anda butuhkan untuk mengelola bisnis laundry dalam satu platform terintegrasi
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-indigo-600" />}
              title="Manajemen Pesanan"
              description="Kelola pesanan pelanggan dengan mudah, dari penerimaan hingga pengiriman"
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-indigo-600" />}
              title="Pelacakan Real-time"
              description="Pantau status pesanan secara real-time dan kirim notifikasi otomatis"
            />
            <FeatureCard
              icon={<Truck className="h-10 w-10 text-indigo-600" />}
              title="Manajemen Pengiriman"
              description="Atur jadwal pengiriman dan pengambilan untuk meningkatkan layanan pelanggan"
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-indigo-600" />}
              title="Kontrol Kualitas"
              description="Pantau dan pertahankan kualitas layanan dengan sistem pengecekan terintegrasi"
            />
            <FeatureCard
              icon={<Send className="h-10 w-10 text-indigo-600" />}
              title="Notifikasi Otomatis"
              description="Kirim update status dan pengingat otomatis ke pelanggan melalui SMS"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-10 w-10 text-indigo-600" />}
              title="Keamanan Data"
              description="Lindungi data pelanggan dan transaksi dengan sistem keamanan berlapis"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-16 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Mulai Kelola Bisnis Laundry Anda Sekarang
              </h2>
              <p className="max-w-[600px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Daftar hari ini dan nikmati semua fitur untuk mempermudah operasional bisnis laundry Anda
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row mt-4">
              <Button 
                size="lg" 
                onClick={() => router.push('/register')}
                className="bg-white text-indigo-600 hover:bg-gray-100"
              >
                Daftar Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => router.push('/login')}
                className="text-white border-white hover:bg-white/10"
              >
                Masuk
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-8 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{APP_NAME}</h3>
              <p className="text-gray-600 text-sm">
                Solusi terbaik untuk bisnis laundry Anda. Platform manajemen terintegrasi untuk meningkatkan efisiensi operasional.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Tautan Cepat</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-sm text-gray-600 hover:text-indigo-600">Masuk</Link></li>
                <li><Link href="/register" className="text-sm text-gray-600 hover:text-indigo-600">Daftar</Link></li>
                <li><Link href="#track-order" className="text-sm text-gray-600 hover:text-indigo-600">Lacak Pesanan</Link></li>
                <li><Link href="/about" className="text-sm text-gray-600 hover:text-indigo-600">Tentang Kami</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600">support@laundryapp.com</li>
                <li className="text-sm text-gray-600">+62 123 4567 890</li>
                <li className="text-sm text-gray-600">Jl. Kenanga No. 123, Jakarta</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/terms" 
                className="text-sm text-gray-500 hover:text-indigo-600"
              >
                Terms
              </Link>
              <Link 
                href="/privacy" 
                className="text-sm text-gray-500 hover:text-indigo-600"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}
