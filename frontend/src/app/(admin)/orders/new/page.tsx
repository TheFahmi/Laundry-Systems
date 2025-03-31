'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OrderFlowMobile from '@/components/mobile/OrderFlowMobile';
import OrderCreateDesktop from '@/components/desktop/OrderCreateDesktop';

// Helper function to check if code is running in browser
const isBrowser = typeof window !== 'undefined';

export default function CreateOrderPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initialize
    checkIsMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // For mobile devices, use the mobile UI
  if (isMobile) {
    return <OrderFlowMobile />;
  }
  
  // For desktop devices, use the desktop component
  return <OrderCreateDesktop />;
} 