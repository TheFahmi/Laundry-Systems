"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

/**
 * AuthGuard component to protect routes based on authentication and role requirements
 * 
 * @param children - Content to render if authorized
 * @param requiredRole - Optional role or array of roles required for access
 * @param redirectTo - Where to redirect if not authorized (defaults to /login)
 */
export function AuthGuard({ 
  children, 
  requiredRole, 
  redirectTo = "/login" 
}: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  
  useEffect(() => {
    // Don't check during initial loading
    if (loading) return;
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push(redirectTo);
      return;
    }
    
    // If there's a role requirement and the user is authenticated,
    // check if they have the required role
    if (requiredRole && user) {
      const hasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;
        
      if (!hasRequiredRole) {
        // Redirect to dashboard if authenticated but wrong role
        router.push("/admin/dashboard");
      }
    }
  }, [user, loading, isAuthenticated, requiredRole, router, redirectTo]);
  
  // Show nothing while loading
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If we have required roles, only show content if user has the right role
  if (requiredRole && user) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;
      
    if (!hasRequiredRole) {
      return null; // Don't render anything while redirecting
    }
  }
  
  // Only render children when authenticated (role check passed above if required)
  return isAuthenticated ? <>{children}</> : null;
} 