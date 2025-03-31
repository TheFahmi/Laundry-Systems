'use client';

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PaymentMethod } from './PaymentForm';

interface PaymentMethodStepProps {
  paymentMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodStep({ paymentMethod, onSelect }: PaymentMethodStepProps) {
  // Map of payment methods with their icons and labels
  const paymentMethods = [
    { value: PaymentMethod.CASH, label: 'Tunai', icon: '💵' },
    { value: PaymentMethod.CREDIT_CARD, label: 'Kartu Kredit', icon: '💳' },
    { value: PaymentMethod.DEBIT_CARD, label: 'Kartu Debit', icon: '💳' },
    { value: PaymentMethod.TRANSFER, label: 'Transfer Bank', icon: '🏦' },
    { value: PaymentMethod.EWALLET, label: 'E-Wallet', icon: '📱' },
    { value: PaymentMethod.OTHER, label: 'Lainnya', icon: '🔄' }
  ];

  return (
    <div>
      <h3 className="text-base font-medium mb-3">Metode Pembayaran</h3>
      
      <RadioGroup 
        value={paymentMethod} 
        onValueChange={(value) => onSelect(value as PaymentMethod)}
        className="flex flex-col space-y-2"
      >
        {paymentMethods.map((method) => (
          <div
            key={method.value}
            className={`flex items-center p-2 border rounded-md cursor-pointer transition-colors ${
              paymentMethod === method.value 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-border hover:border-muted-foreground'
            }`}
            onClick={() => onSelect(method.value)}
          >
            <RadioGroupItem 
              value={method.value} 
              id={method.value} 
              className="mr-2"
            />
            <div className="mr-2 text-xl">{method.icon}</div>
            <Label htmlFor={method.value} className="cursor-pointer">
              {method.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}