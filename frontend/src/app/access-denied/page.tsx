"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AccessDenied() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // If user is authenticated and has a customer role
    if (isAuthenticated && user?.role === 'customer') {
      // Redirect to customer dashboard after a short delay
      const redirectTimer = setTimeout(() => {
        router.push('/customer/dashboard');
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Access Denied</h1>
          
          {user?.role === 'customer' ? (
            <>
              <p className="mt-4 text-lg text-gray-600">
                Staff-only area detected. Redirecting you to your customer dashboard...
              </p>
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-lg text-gray-600">
                You don't have permission to access this page. This area is restricted to staff members only.
              </p>
              
              <div className="mt-8 space-y-4">
                <Link 
                  href="/"
                  className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Return to Home
                </Link>
                
                <button 
                  onClick={() => router.back()}
                  className="block w-full px-4 py-2 text-sm font-medium text-blue-600 bg-transparent hover:bg-blue-50 border border-blue-600 rounded-md"
                >
                  Go Back
                </button>
              </div>
              
              <p className="mt-6 text-sm text-gray-500">
                If you believe this is an error, please contact the administrator.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 