import React, { useEffect, useState, ReactNode } from 'react';
import { XCircle } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  showHandle = true,
  showCloseButton = false
}: BottomSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle opening and closing with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Start the animation after a small delay to ensure the component is mounted
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for the animation to complete before unmounting
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/50 z-50 flex items-end justify-center transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`} 
      onClick={() => onClose()}
    >
      <div 
        className={`bg-white rounded-t-xl max-w-md w-full max-h-[90vh] overflow-auto transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {showHandle && (
          <div className="p-1 flex justify-center">
            <div className="w-10 h-1 bg-gray-300 rounded-full my-2"></div>
          </div>
        )}
        
        {(title || description) && (
          <div className="p-4 border-b relative">
            {showCloseButton && (
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
            
            {title && <h2 className="text-xl font-semibold text-center">{title}</h2>}
            {description && <p className="text-center text-gray-500 mt-1">{description}</p>}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
} 