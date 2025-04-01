import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import { APP_NAME } from "@/config";
import { ThemeProvider } from "@/components/ui/theme-provider";
import '../styles/calendar-styles.css';
import '../styles/cursor-fixes.css';
import '../styles/calendar-fixes.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Sistem Manajemen Laundry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
