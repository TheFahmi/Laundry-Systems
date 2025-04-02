'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPayment } from '@/services/paymentService';
import { PaymentMethod, PaymentStatus, methodLabels, statusLabels } from '@/types/payment';

export default function CreatePaymentPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    orderId: '',
    paymentMethod: PaymentMethod.CASH,
    status: PaymentStatus.PENDING,
    amount: 0,
    notes: '',
    transactionId: '',
    referenceNumber: `PAY-${Date.now()}`
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await createPayment(formData);
      router.push(`/payments/${response.id}`);
    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError(err.message || 'Failed to create payment');
      setLoading(false);
    }
  };
  
  // Go back to payments list
  const handleBack = () => {
    router.push('/payments');
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2 mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          Back to List
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Payment</CardTitle>
          <CardDescription>Enter payment details below</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID *</Label>
              <Input
                id="orderId"
                placeholder="Enter order ID"
                value={formData.orderId}
                onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the ID of the order to be paid
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">Rp</span>
                  <Input
                    id="amount"
                    type="number"
                    className="pl-10"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: string) => setFormData({...formData, paymentMethod: value as PaymentMethod})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(methodLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Payment Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => setFormData({...formData, status: value as PaymentStatus})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentStatus.PENDING}>{statusLabels[PaymentStatus.PENDING]}</SelectItem>
                  <SelectItem value={PaymentStatus.COMPLETED}>{statusLabels[PaymentStatus.COMPLETED]}</SelectItem>
                  <SelectItem value={PaymentStatus.FAILED}>{statusLabels[PaymentStatus.FAILED]}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID (optional)</Label>
              <Input
                id="transactionId"
                placeholder="Enter transaction ID from payment provider"
                value={formData.transactionId}
                onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Transaction ID from payment service provider (if available)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this payment"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Payment'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 