'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  // Log the error for debugging
  useEffect(() => {
    console.error('404 Not Found: Current path is not valid');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full shadow-lg border-none">
        <CardHeader className="pb-0 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-red-600 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Halaman Tidak Ditemukan</h2>
        </CardHeader>
        <CardContent className="pt-4 pb-6 text-center">
          <p className="text-gray-600">
            Halaman yang Anda cari tidak ditemukan atau mungkin telah dipindahkan.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-3 pb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="px-5"
          >
            Kembali
          </Button>
          <Button 
            variant="default"
            className="px-5 bg-indigo-600 hover:bg-indigo-700"
            asChild
          >
            <Link href="/dashboard">Ke Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 