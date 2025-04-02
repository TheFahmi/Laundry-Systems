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
import { OrderTracker } from '@/components/ui/order-tracker';

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
      <section className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Layanan Laundry Terbaik untuk Kebutuhan Anda
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Kami menawarkan layanan laundry berkualitas dengan pengiriman cepat dan harga terjangkau.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/login" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md transition duration-300 text-center cursor-pointer"
              >
                Masuk / Daftar
              </Link>
              <Link 
                href="/tracking" 
                className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-medium py-3 px-6 rounded-md border border-indigo-600 dark:border-indigo-500 transition duration-300 text-center cursor-pointer"
              >
                Lacak Pesanan
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* SVG Animation */}
            <div className="w-full max-w-md relative">
              <Image
                src="/assets/laundry-hero-animation.svg"
                alt="Laundry Service Illustration"
                width={600}
                height={400}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Order Tracking Section */}
      <section className="w-full py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">
                Lacak Status Pesanan Anda
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Pantau status pesanan laundry Anda secara real-time. Cukup masukkan nomor pesanan
                dan verifikasi nomor telepon untuk memulai.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div className="flex items-start space-x-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full text-blue-600 dark:text-blue-300">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Update Real-time</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lacak pesanan Anda di setiap tahap</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full text-green-600 dark:text-green-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Waktu Proses</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ketahui kapan pesanan Anda akan siap</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full text-purple-600 dark:text-purple-300">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Status Pengiriman</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lacak pengiriman laundry bersih Anda</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full text-amber-600 dark:text-amber-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Verifikasi Aman</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verifikasi sederhana dengan digit telepon</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <OrderTracker className="max-w-md mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-gray-50 mb-12">
            Mengapa Memilih Layanan Kami?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-50">Layanan Cepat</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Kami menjamin pengerjaan laundry yang cepat dan tepat waktu untuk memenuhi kebutuhan Anda.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-50">Kualitas Terjamin</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Kami menggunakan deterjen berkualitas dan proses yang teliti untuk hasil terbaik.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-50">Harga Terjangkau</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Layanan berkualitas dengan harga yang kompetitif dan transparan tanpa biaya tersembunyi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-16 relative overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-800 dark:to-blue-900 opacity-95"></div>
        
        {/* Animated shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-white/20">
            <div className="grid md:grid-cols-5 gap-8 items-center">
              <div className="md:col-span-3 space-y-6">
                <div>
                  <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
                    Solusi Bisnis Laundry
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                    Mulai Kelola Bisnis Laundry Anda Sekarang
                  </h2>
                  <p className="text-white/80 text-lg max-w-xl">
                    Tingkatkan efisiensi operasional, kelola pesanan dengan mudah, dan optimalkan layanan pelanggan dengan sistem manajemen laundry kami.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => router.push('/register')}
                    className="bg-white text-indigo-600 dark:bg-gray-100 dark:text-indigo-700 hover:bg-gray-100 dark:hover:bg-white shadow-lg shadow-blue-900/20 font-medium px-6 cursor-pointer"
                  >
                    Daftar Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/login')}
                    className="text-white border-white border-2 bg-white/15 hover:bg-white/25 font-medium px-6 cursor-pointer shadow-md shadow-blue-900/10"
                  >
                    Masuk ke Akun
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-xs text-blue-800 font-medium border-2 border-white">JP</div>
                    <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center text-xs text-purple-800 font-medium border-2 border-white">AL</div>
                    <div className="w-8 h-8 rounded-full bg-green-300 flex items-center justify-center text-xs text-green-800 font-medium border-2 border-white">SD</div>
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-xs text-indigo-800 font-medium border-2 border-white">+5</div>
                  </div>
                  <p className="text-sm text-white/80">
                    Bergabung dengan <span className="font-semibold text-white">500+</span> pemilik bisnis laundry
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-2 relative">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Manajemen Pesanan</h4>
                        <p className="text-sm text-white/70">Kelola semua pesanan dalam satu platform</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Pengiriman & Pengambilan</h4>
                        <p className="text-sm text-white/70">Atur jadwal logistik dengan efisien</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Laporan Bisnis</h4>
                        <p className="text-sm text-white/70">Analisis kinerja dan pertumbuhan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 dark:border-gray-700 py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{APP_NAME}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Solusi terbaik untuk bisnis laundry Anda. Platform manajemen terintegrasi untuk meningkatkan efisiensi operasional.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Tautan Cepat</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Masuk</Link></li>
                <li><Link href="/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Daftar</Link></li>
                <li><Link href="#track-order" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Lacak Pesanan</Link></li>
                <li><Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Tentang Kami</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Kontak</h3>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 dark:text-gray-400">support@laundryapp.com</li>
                <li className="text-sm text-gray-600 dark:text-gray-400">+62 123 4567 890</li>
                <li className="text-sm text-gray-600 dark:text-gray-400">Jl. Kenanga No. 123, Jakarta</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/terms" 
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Terms
              </Link>
              <Link 
                href="/privacy" 
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
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
