import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CsrfProvider } from "@/providers/CsrfProvider";
import { Toaster } from "react-hot-toast";
import { APP_NAME } from "@/config";

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
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <CsrfProvider>
            <ThemeProvider>
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </CsrfProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
