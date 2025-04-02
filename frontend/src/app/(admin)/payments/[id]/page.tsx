'use client';

import React, { useState, useEffect } from 'react';
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
import { PaymentStatusBadge } from '@/components/ui/payment-status-badge';
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { getPayment, updatePayment, deletePayment } from '@/services/paymentService';
import { 
  Payment, 
  PaymentStatus, 
  PaymentMethod, 
  methodLabels, 
  statusLabels 
} from '@/types/payment';
import { formatRupiah, formatDate } from '@/lib/utils';

// Define the types for the route params
interface PaymentParams {
  id: string;
}

export default function PaymentDetailPage({ params }: { params: PaymentParams | Promise<PaymentParams> }) {
  const router = useRouter();
  // Use React.use() to unwrap the params object
  const unwrappedParams = React.use(params as any) as PaymentParams;
  const { id } = unwrappedParams;
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedPayment, setEditedPayment] = useState<Partial<Payment>>({});
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch payment detail
  useEffect(() => {
    const fetchPaymentDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching payment with ID: ${id}`);
        const paymentData = await getPayment(id);
        console.log('Payment data received:', paymentData);
        
        setPayment(paymentData);
        setEditedPayment({
          status: paymentData.status,
          notes: paymentData.notes
        });
      } catch (err: any) {
        console.error('Error fetching payment details:', err);
        setError(err.message || 'Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetail();
  }, [id]);
  
  // Handle edit payment
  const handleEdit = async () => {
    if (!payment) return;
    
    try {
      setLoading(true);
      const updatedPayment = await updatePayment(id, editedPayment);
      setPayment(updatedPayment);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating payment:', err);
      setError(err.message || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete payment
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deletePayment(id);
      setDeleteDialogOpen(false);
      router.push('/payments');
    } catch (err: any) {
      console.error('Error deleting payment:', err);
      setError(err.message || 'Failed to delete payment');
      setLoading(false);
    }
  };
  
  // Go back to payments list
  const handleBack = () => {
    router.push('/payments');
  };
  
  if (loading && !payment) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center my-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (error && !payment) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Button
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          Back to List
        </Button>
      </div>
    );
  }
  
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
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>ID: {payment?.id}</CardDescription>
          </div>
          {payment && <PaymentStatusBadge status={payment.status} />}
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center my-2">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {payment && !isEditing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                  <p>{payment.orderId || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p className="font-semibold">{formatRupiah(payment.amount)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                  <p>{methodLabels[payment.paymentMethod as PaymentMethod] || payment.paymentMethod}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                  <p>{payment.transactionId || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reference Number</h3>
                  <p>{payment.referenceNumber || '-'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                  <p>{formatDate(payment.createdAt)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
                  <p>{formatDate(payment.updatedAt)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="whitespace-pre-wrap">{payment.notes || '-'}</p>
              </div>
            </div>
          )}
          
          {payment && isEditing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editedPayment.status}
                  onValueChange={(value) => setEditedPayment({...editedPayment, status: value as PaymentStatus})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentStatus.PENDING}>{statusLabels[PaymentStatus.PENDING]}</SelectItem>
                    <SelectItem value={PaymentStatus.COMPLETED}>{statusLabels[PaymentStatus.COMPLETED]}</SelectItem>
                    <SelectItem value={PaymentStatus.FAILED}>{statusLabels[PaymentStatus.FAILED]}</SelectItem>
                    <SelectItem value={PaymentStatus.REFUNDED}>{statusLabels[PaymentStatus.REFUNDED]}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes"
                    value={editedPayment.notes || ''}
                  onChange={(e) => setEditedPayment({...editedPayment, notes: e.target.value})}
                    rows={3}
                  />
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {!isEditing ? (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                Edit
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete this payment record.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                      {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleEdit} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                Cancel
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 