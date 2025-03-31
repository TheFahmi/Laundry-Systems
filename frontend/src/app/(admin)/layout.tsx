import React, { ReactNode } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ThemeProvider } from '@/components/ui/theme-provider';
import CsrfInitializer from '@/components/CsrfInitializer';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <AdminHeader />
          <main className="flex-1 px-4 py-6">
            <CsrfInitializer />
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
} 