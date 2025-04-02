'use client';

import { useState, useEffect } from 'react';
import { Check, User, ShoppingCart, ListChecks, CreditCard, ClipboardCheck } from 'lucide-react';

// Step names
export const ORDER_STEPS = [
  { id: 'customer', title: 'Pelanggan', icon: User },
  { id: 'service', title: 'Layanan', icon: ShoppingCart },
  { id: 'details', title: 'Detail', icon: ListChecks },
  { id: 'confirm', title: 'Konfirmasi', icon: ClipboardCheck },
  { id: 'payment', title: 'Pembayaran', icon: CreditCard },
  { id: 'complete', title: 'Selesai', icon: Check },
];

interface OrderStepperMobileProps {
  currentStep: number;
}

export default function OrderStepperMobile({ currentStep }: OrderStepperMobileProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 no-scrollbar">
      <div className="flex min-w-max px-4 space-x-2">
        {ORDER_STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          const Icon = step.icon;
          
          return (
            <div 
              key={step.id} 
              className={`flex flex-col items-center w-16 ${isActive ? 'opacity-100' : 'opacity-60'}`}
            >
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center mb-1
                  ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
                `}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className="text-xs font-medium text-center leading-tight">{step.title}</span>
              <div className="h-1 w-full mt-1">
                <div 
                  className={`h-1 rounded ${isActive || isCompleted ? 'bg-primary' : 'bg-muted'}`} 
                  style={{ width: isActive ? '50%' : isCompleted ? '100%' : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 