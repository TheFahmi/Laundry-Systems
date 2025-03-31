import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
  className?: string;
}

export function LoadingIndicator({ 
  size = 'md', 
  text = 'Loading...', 
  fullPage = false, 
  className 
}: LoadingIndicatorProps) {
  const containerClasses = cn(
    'flex flex-col items-center justify-center',
    fullPage ? 'min-h-screen w-full' : 'h-40',
    className
  );

  return (
    <div className={containerClasses}>
      <LoadingSpinner size={size} />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
} 