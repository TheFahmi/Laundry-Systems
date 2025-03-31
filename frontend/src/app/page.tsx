'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { APP_NAME } from '@/config';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sparkles, Clock, Truck } from 'lucide-react';
import Link from 'next/link';
import { ModeToggle } from '@/components/ui/mode-toggle';

// Define the FeatureCard props interface
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke /dashboard jika sudah login
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6 items-center">
            <ModeToggle />
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Masuk
            </Button>
            <Button onClick={() => router.push('/register')}>
              Daftar
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {APP_NAME}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Solusi lengkap untuk bisnis laundry Anda. Kelola pelanggan, pesanan, 
                  dan pembayaran dengan mudah serta pantau bisnis Anda secara real-time.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" onClick={() => router.push('/login')}>
                  Masuk
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/register')}>
                  Daftar
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:w-full">
              <Card className="overflow-hidden">
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

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Fitur Unggulan</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Semua yang Anda butuhkan untuk mengelola bisnis laundry dalam satu platform
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <FeatureCard
              icon={<Sparkles className="h-10 w-10" />}
              title="Manajemen Pesanan"
              description="Kelola pesanan pelanggan dengan mudah, dari penerimaan hingga pengiriman"
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10" />}
              title="Pelacakan Real-time"
              description="Pantau status pesanan secara real-time dan kirim notifikasi otomatis"
            />
            <FeatureCard
              icon={<Truck className="h-10 w-10" />}
              title="Manajemen Pengiriman"
              description="Atur jadwal pengiriman dan pengambilan untuk meningkatkan layanan pelanggan"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Mulai Kelola Bisnis Laundry Anda Sekarang
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Daftar hari ini dan nikmati semua fitur untuk mempermudah operasional bisnis laundry Anda
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" onClick={() => router.push('/register')}>
                Daftar Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Terms
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="flex flex-col items-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground mt-2">{description}</p>
    </Card>
  );
}
