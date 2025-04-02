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
      <section className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Layanan Laundry Terbaik untuk Kebutuhan Anda
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Kami menawarkan layanan laundry berkualitas dengan pengiriman cepat dan harga terjangkau.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/login" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md transition duration-300 text-center"
              >
                Masuk / Daftar
              </Link>
              <Link 
                href="/tracking" 
                className="bg-white hover:bg-gray-100 text-indigo-600 font-medium py-3 px-6 rounded-md border border-indigo-600 transition duration-300 text-center"
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

      {/* Order tracking section */}
      <section className="w-full py-16" id="track-order">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <OrderTracker />
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-indigo-900">
                  Track Your Order Status
                </h2>
                <p className="text-gray-600">
                  Stay updated with your laundry order status in real-time. Just enter your order number 
                  and phone number verification to get started.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Real-time Updates</h3>
                      <p className="text-sm text-gray-500">Track your order at any stage</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Processing Time</h3>
                      <p className="text-sm text-gray-500">Know exactly when your order will be ready</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Delivery Status</h3>
                      <p className="text-sm text-gray-500">Track delivery of your clean laundry</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Secure Verification</h3>
                      <p className="text-sm text-gray-500">Simple verification with phone digits</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Mengapa Memilih Layanan Kami?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Layanan Cepat</h3>
              <p className="text-gray-600">
                Kami menjamin pengerjaan laundry yang cepat dan tepat waktu untuk memenuhi kebutuhan Anda.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Kualitas Terjamin</h3>
              <p className="text-gray-600">
                Kami menggunakan deterjen berkualitas dan proses yang teliti untuk hasil terbaik.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Harga Terjangkau</h3>
              <p className="text-gray-600">
                Layanan berkualitas dengan harga yang kompetitif dan transparan tanpa biaya tersembunyi.
              </p>
            </div>
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
