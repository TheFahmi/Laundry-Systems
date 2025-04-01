import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CustomerSelect from './CustomerSelect';
import ServiceSelect from './ServiceSelect';
import OrderSummary from './OrderSummary';
import PaymentStep from './PaymentStep';
import OrderConfirmation from './OrderConfirmation';
import { createAuthHeaders } from '@/lib/api-utils';
import Link from 'next/link';
import PaymentFlow from '@/components/payments/PaymentFlow';
import { Service, ServicePriceModel } from '@/types/service';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Separator 
} from "@/components/ui/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import {
  Textarea
} from "@/components/ui/textarea";
import {
  Stepper,
  Step,
  StepLabel,
  StepContent
} from "@/components/ui/stepper";
import { Loader2, CheckCircle, Check, User, ShoppingCart, ClipboardCheck, CreditCard, CheckCircle as CheckCircleIcon, TruckIcon, HomeIcon, NotebookIcon, MessageSquareIcon, FileTextIcon, ClockIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { addHours } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

// Local interface definitions
interface OrderItem {
  serviceId?: string;
  id?: string;
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
  service?: Service;
}

interface PaymentData {
  amount: number;
  change: number;
  method: string;
  status: string;
  referenceNumber?: string;
}

interface OrderFlowProps {
  onComplete?: (orderId: string) => void;
}

// Add this helper function at the top
const isBrowser = typeof window !== 'undefined';

export default function OrderFlow({ onComplete }: OrderFlowProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(() => {
    // Try to load saved step from localStorage
    if (isBrowser) {
      const savedStep = localStorage.getItem('orderActiveStep');
      return savedStep ? parseInt(savedStep, 10) : 0;
    }
    return 0;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [orderData, setOrderData] = useState(() => {
    // Try to load saved order data from localStorage
    if (isBrowser) {
      const savedOrderData = localStorage.getItem('orderData');
      if (savedOrderData) {
        try {
          return JSON.parse(savedOrderData);
        } catch (e) {
          console.error('Failed to parse saved order data:', e);
        }
      }
    }
    // Default initial state
    return {
      customerId: '',
      customerName: '',
      items: [],
      notes: '',
      isDeliveryNeeded: false,
      pickupDate: undefined,
      deliveryDate: undefined,
      specialRequirements: '',
      total: 0
    };
  });
  const [paymentData, setPaymentData] = useState<PaymentData>(() => {
    // Try to load saved payment data from localStorage
    if (isBrowser) {
      const savedPaymentData = localStorage.getItem('orderPaymentData');
      if (savedPaymentData) {
        try {
          return JSON.parse(savedPaymentData);
        } catch (e) {
          console.error('Failed to parse saved payment data:', e);
        }
      }
    }
    // Default initial state
    return {
      amount: 0,
      change: 0,
      method: 'cash',
      status: 'pending'
    };
  });
  const [createdOrder, setCreatedOrder] = useState<{
    id: string;
    orderNumber: string;
    createdAt: string;
  } | null>(() => {
    // Try to load saved created order from localStorage
    if (isBrowser) {
      const savedCreatedOrder = localStorage.getItem('createdOrder');
      if (savedCreatedOrder) {
        try {
          return JSON.parse(savedCreatedOrder);
        } catch (e) {
          console.error('Failed to parse saved created order:', e);
        }
      }
    }
    return null;
  });
  const [skipPayment, setSkipPayment] = useState(() => {
    // Try to load saved skipPayment state from localStorage
    if (isBrowser) {
      const savedSkipPayment = localStorage.getItem('orderSkipPayment');
      return savedSkipPayment === 'true';
    }
    return false;
  });

  // Add state for calendar popovers
  const [selfPickupCalendarOpen, setSelfPickupCalendarOpen] = useState(false);
  const [deliveryPickupCalendarOpen, setDeliveryPickupCalendarOpen] = useState(false);
  const [deliveryCalendarOpen, setDeliveryCalendarOpen] = useState(false);

  // Define the updated steps array with combined first step
  const steps = ['Informasi Pelanggan', 'Detail Pesanan', 'Konfirmasi', 'Pembayaran', 'Selesai'];
  
  // Define icons for each step
  const stepIcons = [
    <User className="h-5 w-5" key="user" />,
    <ShoppingCart className="h-5 w-5" key="cart" />,
    <ClipboardCheck className="h-5 w-5" key="clipboard" />,
    <CreditCard className="h-5 w-5" key="payment" />,
    <CheckCircleIcon className="h-5 w-5" key="complete" />
  ];

  // Add this ref before the useEffect
  const skipPaymentProcessedRef = useRef(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem('orderActiveStep', activeStep.toString());
      localStorage.setItem('orderData', JSON.stringify(orderData));
      localStorage.setItem('orderPaymentData', JSON.stringify(paymentData));
      localStorage.setItem('orderSkipPayment', skipPayment.toString());
      if (createdOrder) {
        localStorage.setItem('createdOrder', JSON.stringify(createdOrder));
      }
    }
  }, [activeStep, orderData, paymentData, skipPayment, createdOrder]);

  // Clear all order data from localStorage when the component unmounts
  useEffect(() => {
    return () => {
      // Only clear if we're not on the final step
      if (activeStep !== steps.length - 1) {
        // Keep data for now, will be cleared on completion or manual reset
      }
    };
  }, [activeStep, steps.length]);

  // Calculate subtotal correctly for weight-based items
  const calculateSubtotal = (item: OrderItem): number => {
    if (item.weightBased && item.weight !== undefined) {
      // For weight-based items, use weight
      return item.price * item.weight;
    } else {
      // For regular items, use quantity
      return item.price * item.quantity;
    }
  };

  // Calculate total amount considering weightBased items
  const calculateTotal = (items: OrderItem[]): number => {
    console.log("Calculating total from items:", items);
    
    const total = items.reduce((sum, item) => {
      // Use the subtotal directly from each item
      console.log(`Item ${item.serviceName} subtotal: ${item.subtotal}`);
      return sum + (item.subtotal || 0);
    }, 0);

    console.log("Final total:", total);
    return total;
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId: string, customerName: string) => {
    setOrderData((prev: typeof orderData) => ({
      ...prev,
      customerId,
      customerName,
      customer: { id: customerId, name: customerName }
    }));
  };

  // Handle service selection
  const handleServiceSelect = (items: OrderItem[]) => {
    const total = calculateTotal(items);
    setOrderData((prev: typeof orderData) => ({
      ...prev,
      items,
      total
    }));
  };

  // Handler untuk detail pesanan
  const handleOrderDetails = (notes: string) => {
    setOrderData((prev: typeof orderData) => ({
      ...prev,
      notes,
      // Make sure we preserve other order details that may have been set in the UI
      isDeliveryNeeded: prev.isDeliveryNeeded,
      pickupDate: prev.pickupDate,
      deliveryDate: prev.deliveryDate,
      specialRequirements: prev.specialRequirements
    }));
  };

  // Handler untuk pembayaran
  const handlePaymentUpdate = (payment: any) => {
    // Ensure compatibility by adding the status property if missing
    const updatedPayment = {
      ...payment,
      status: payment.status || payment.completed || 'pending',
      // Ensure referenceNumber is properly included for non-cash payments
      referenceNumber: payment.method !== 'cash' && payment.referenceNumber 
        ? payment.referenceNumber 
        : undefined
    };
    setPaymentData(updatedPayment);
  };

  // Memisahkan logika konfirmasi dan navigasi
  const handleConfirmOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate data without creating order yet
      const orderPayload = {
        customerId: orderData.customerId,
        items: orderData.items.map((item: OrderItem) => {
          // Base item properties
          const processedItem: any = {
            serviceId: item.serviceId,
            serviceName: item.serviceName,
            quantity: item.quantity,
            price: item.price
          };
          
          // Add weight for weight-based items
          if (item.weightBased && item.weight) {
            processedItem.weightBased = true;
            processedItem.weight = item.weight;
            
            console.log(`Validated weight-based item: ${item.serviceName}, Weight: ${processedItem.weight}kg`);
          }
          
          return processedItem;
        }),
        notes: orderData.notes,
        specialRequirements: orderData.specialRequirements,
        isDeliveryNeeded: orderData.isDeliveryNeeded,
        pickupDate: orderData.pickupDate,
        deliveryDate: orderData.deliveryDate,
        totalAmount: calculateTotal(orderData.items)
      };

      console.log('Order data validated and ready:', JSON.stringify(orderPayload));
      
      // If we're skipping payment, create order immediately
      if (skipPayment) {
        await createOrderWithoutPayment(orderPayload);
      } else {
        // Otherwise, just continue to payment step
        setDirection('forward');
        handleNext();
      }
    } catch (error: any) {
      console.error('Error in validation process:', error);
      const errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(errorMessage);
      toast({
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [orderData, skipPayment, calculateTotal]);

  // Function to create order without payment (for skipPayment case)
  const createOrderWithoutPayment = async (orderPayload: any) => {
    setIsLoading(true);
    try {
      const apiUrl = '/api/orders';
      
      console.log('Creating order without payment:', JSON.stringify(orderPayload));

      const orderResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error creating order: ${orderResponse.status}`;
        console.error('API Error:', errorData);
        setError(errorMessage);
        toast({
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      const orderResponseData = await orderResponse.json();
      let orderResult = extractOrderData(orderResponseData);
      
      if (!orderResult.id) {
        throw new Error('Order ID not found in response');
      }

      // Clear saved items from localStorage when order is confirmed
      localStorage.removeItem('orderItems');
      
      setCreatedOrder({
        id: orderResult.id,
        orderNumber: orderResult.orderNumber || `#${orderResult.id.slice(0, 8)}`,
        createdAt: orderResult.createdAt || new Date().toISOString()
      });
      
      toast({
        description: 'Pesanan berhasil dibuat!',
        variant: "default"
      });
      
      // Go to last step
      setDirection('forward');
      setActiveStep(steps.length - 1);
      
      // Call the callback if provided
      if (onComplete) {
        onComplete(orderResult.id);
      }
      
      // Clear all order state from localStorage on successful order completion
      clearAllOrderState();
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(errorMessage);
      toast({
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract order data consistently
  const extractOrderData = (responseData: any) => {
    let result;
    if (responseData.data) {
      console.log('Response has data property:', responseData.data);
      if (responseData.data.data) {
        result = responseData.data.data;
      } else {
        result = responseData.data;
      }
    } else {
      result = responseData;
    }
    
    console.log('Extracted data:', result);
    return result;
  };

  // New function to finalize payment and create order
  const finalizePaymentAndOrder = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare order payload
      const orderPayload = {
        customerId: orderData.customerId,
        items: orderData.items.map((item: OrderItem) => {
          const processedItem: any = {
            serviceId: item.serviceId,
            serviceName: item.serviceName,
            quantity: item.quantity,
            price: item.price
          };
          
          if (item.weightBased && item.weight) {
            processedItem.weightBased = true;
            processedItem.weight = item.weight;
          }
          
          return processedItem;
        }),
        notes: orderData.notes,
        specialRequirements: orderData.specialRequirements,
        isDeliveryNeeded: orderData.isDeliveryNeeded,
        pickupDate: orderData.pickupDate,
        deliveryDate: orderData.deliveryDate,
        totalAmount: calculateTotal(orderData.items),
        // Include payment info for more efficient processing
        payment: {
          method: paymentData.method,
          amount: Number(paymentData.amount) || orderData.total,
          change: paymentData.change || 0,
          referenceNumber: paymentData.method !== 'cash' && paymentData.referenceNumber 
            ? paymentData.referenceNumber 
            : undefined,
        }
      };

      console.log('Creating order with payment in single call:', JSON.stringify(orderPayload));

      // Call API to create order with payment
      const apiUrl = '/api/orders';
      const orderResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error creating order: ${orderResponse.status}`;
        console.error('API Error:', errorData);
        throw new Error(errorMessage);
      }

      const orderResponseData = await orderResponse.json();
      const orderResult = extractOrderData(orderResponseData);
      
      if (!orderResult.id) {
        throw new Error('Order ID not found in response');
      }

      // Clear saved items from localStorage
      localStorage.removeItem('orderItems');
      
      // Update UI with success
      setCreatedOrder({
        id: orderResult.id,
        orderNumber: orderResult.orderNumber || `#${orderResult.id.slice(0, 8)}`,
        createdAt: orderResult.createdAt || new Date().toISOString()
      });
      
      // Check if payment data is returned with the order
      if (orderResult.payments && orderResult.payments.length > 0) {
        const paymentResult = orderResult.payments[0];
        // Update payment data with the data from the API response
        setPaymentData({
          amount: paymentResult.amount,
          change: paymentData.change, // Keep local change amount as the API doesn't return it directly
          method: paymentResult.paymentMethod,
          status: paymentResult.status,
          referenceNumber: paymentResult.referenceNumber
        });
        
        console.log('Payment data received from API:', paymentResult);
        
        // Show completed payment message for all payment methods
        toast({
          description: 'Pembayaran berhasil dikonfirmasi! Pesanan telah dibuat.',
          variant: "default"
        });
      } else {
        // If no payment data is returned, just update the status
        setPaymentData((prev: PaymentData) => ({
          ...prev,
          status: 'pending' // Keep as pending since API didn't confirm payment
        }));
        
        console.warn('No payment data received in the API response');
        
        toast({
          description: 'Pembayaran diproses. Pesanan berhasil dibuat!',
          variant: "default"
        });
      }
      
      // Go to completion step
      setDirection('forward');
      setActiveStep(steps.length - 1);
      
      // Call the callback if provided
      if (onComplete) {
        onComplete(orderResult.id);
      }
      
      // Clear all order state from localStorage
      clearAllOrderState();
      
    } catch (error: any) {
      console.error('Error finalizing order and payment:', error);
      const errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(errorMessage);
      toast({
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Replace original handlePaymentSubmit with this new one
  const handlePaymentSubmit = async () => {
    try {
      console.log('Processing payment with data:', paymentData);
      await finalizePaymentAndOrder();
    } catch (error: any) {
      console.error('Payment submission failed:', error);
      setError(error.message || 'Pembayaran gagal. Silakan coba lagi.');
    }
  };

  const handleNext = useCallback(() => {
    console.log("Moving to next step");
    
    // When moving to payment step (index 4), initialize payment amount with order total
    if (activeStep === 3) {
      setPaymentData((prev: PaymentData) => ({
        ...prev,
        amount: orderData.total,
        change: 0
      }));
    }
    
    setDirection('forward');
    setActiveStep((prevActiveStep: number) => {
      console.log("Updating activeStep from", prevActiveStep, "to", prevActiveStep + 1);
      return prevActiveStep + 1;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, orderData.total]);

  const handleBack = () => {
    console.log("Moving back from step", activeStep, "to", activeStep - 1);
    setDirection('backward');
    setActiveStep((prevActiveStep: number) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setDirection('backward');
    setActiveStep(0);
    setOrderData({
      customerId: '',
      customerName: '',
      items: [],
      notes: '',
      isDeliveryNeeded: false,
      pickupDate: undefined,
      deliveryDate: undefined,
      specialRequirements: '',
      total: 0
    });
    setPaymentData({
      amount: 0,
      change: 0,
      method: 'cash',
      status: 'pending'
    });
    setCreatedOrder(null);
    setError(null);
    
    // Clear all order state from localStorage when starting a new order
    clearAllOrderState();
  };

  // Add useEffect to handle skipPayment changes - moved after function definitions
  useEffect(() => {
    // Only update UI elements based on skipPayment, don't auto-proceed
    if (activeStep === 3 && skipPayment) {
      // Don't auto-proceed, just update the UI
      skipPaymentProcessedRef.current = true;
    } else if (activeStep === 3 && !skipPayment) {
      // Reset the ref when skipPayment is false
      skipPaymentProcessedRef.current = false;
    }
  // Only depend on these two values
  }, [activeStep, skipPayment]);

  const handleSkipPaymentChange = useCallback((skip: boolean) => {
    // Just update the state without triggering any automatic transitions
    setSkipPayment(skip);
  }, []);

  // Calculate maximum processing time from all items
  const getMaxProcessingTime = () => {
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      // Default to 24 hours if no items or processing time available
      return 24;
    }
    
    let maxHours = 0;
    
    // Check each item's processing time
    orderData.items.forEach((item: OrderItem) => {
      // Try to get processing time from service data or use default values based on service type
      let processingHours = 0;
      
      if (item.service?.processingTimeHours) {
        processingHours = item.service.processingTimeHours;
      } else {
        // Use default processing times based on service name/type
        if (item.serviceName?.toLowerCase().includes('express')) {
          processingHours = 6; // Express services: 6 hours
        } else if (item.serviceName?.toLowerCase().includes('karpet') || 
                  item.serviceName?.toLowerCase().includes('gordyn')) {
          processingHours = 72; // Carpet/Curtain: 72 hours (3 days)
        } else if (item.serviceName?.toLowerCase().includes('dry')) {
          processingHours = 48; // Dry cleaning: 48 hours (2 days)
        } else {
          processingHours = 24; // Standard services: 24 hours (1 day)
        }
      }
      
      // Keep track of maximum processing time
      if (processingHours > maxHours) {
        maxHours = processingHours;
      }
    });
    
    return Math.max(maxHours, 24); // Minimum 24 hours
  };

  // Calculate estimated completion date based on pickup date + processing time
  const getEstimatedCompletionDate = (pickupDate: Date) => {
    const processingHours = getMaxProcessingTime();
    const estimatedDate = new Date(pickupDate);
    
    // Add processing time to pickup date
    if (processingHours >= 24) {
      // Calculate how many days to add (round up)
      const daysToAdd = Math.ceil(processingHours / 24);
      estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    } else {
      // For same-day processing (less than 24 hours), add the hours
      estimatedDate.setTime(estimatedDate.getTime() + (processingHours * 60 * 60 * 1000));
    }
    
    // Set to start of day for cleaner comparison
    estimatedDate.setHours(0, 0, 0, 0);
    
    return estimatedDate;
  };
  
  // Disable dates before earliest pickup date (strict comparison) for self-pickup
  const isDateDisabled = (date: Date) => {
    // If delivery is needed, allow picking up today
    if (orderData.isDeliveryNeeded) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Compare just the dates (ignoring time)
      const dateValue = new Date(date);
      dateValue.setHours(0, 0, 0, 0);
      
      // Return true if date is before today
      return dateValue < today;
    } else {
      // If self-pickup, must respect processing time
      const earliestDate = getEstimatedCompletionDate(new Date(orderData.pickupDate || new Date()));
      
      // Compare just the dates (ignoring time)
      const dateValue = new Date(date);
      dateValue.setHours(0, 0, 0, 0);
      
      // Return true if date is before earliest allowed date
      return dateValue < earliestDate;
    }
  };
  
  // Disable dates before earliest processing time for delivery
  const isDeliveryDateDisabled = (date: Date) => {
    // Compare just the dates (ignoring time)
    const dateValue = new Date(date);
    dateValue.setHours(0, 0, 0, 0);
    
    // If pickup date is selected, use it to calculate the estimated completion date
    if (orderData.pickupDate) {
      const pickupDate = new Date(orderData.pickupDate);
      pickupDate.setHours(0, 0, 0, 0);
      
      // Calculate estimated completion date based on pickup date + processing time
      const estimatedCompletionDate = getEstimatedCompletionDate(pickupDate);
      
      // Use the later date between pickup date and estimated completion date
      const minAllowedDate = estimatedCompletionDate > pickupDate ? estimatedCompletionDate : pickupDate;
      
      // Return true if date is before the minimum allowed date
      return dateValue < minAllowedDate;
    }
    
    // If no pickup date is selected, just return true to disable all dates
    return true;
  };

  // Get formatted processing time for display
  const getFormattedProcessingTime = () => {
    const hours = getMaxProcessingTime();
    if (hours < 24) {
      return `${hours} jam`;
    } else {
      const days = Math.ceil(hours / 24);
      return `${days} hari`;
    }
  };

  // Force cleanup and reset of dates if needed
  useEffect(() => {
    if (!orderData.pickupDate && !orderData.deliveryDate) return;
    
    // Reset pickup date if it's earlier than allowed
    if (orderData.pickupDate) {
      const pickupDate = new Date(orderData.pickupDate);
      const isAllowed = !isDateDisabled(pickupDate);
      if (!isAllowed) {
        setOrderData((prev: typeof orderData) => ({
          ...prev,
          pickupDate: undefined
        }));
      }
    }
    
    // Reset delivery date if it's earlier than allowed
    if (orderData.deliveryDate) {
      const deliveryDate = new Date(orderData.deliveryDate);
      const isAllowed = !isDeliveryDateDisabled(deliveryDate);
      if (!isAllowed) {
        setOrderData((prev: typeof orderData) => ({
          ...prev,
          deliveryDate: undefined
        }));
      }
    }
  }, [orderData.isDeliveryNeeded, orderData.items]);
  
  // Add an effect to reset delivery date if it becomes invalid
  useEffect(() => {
    if (orderData.isDeliveryNeeded && orderData.pickupDate && orderData.deliveryDate) {
      // Convert dates to midnight for accurate comparison
      const pickupDate = new Date(orderData.pickupDate);
      pickupDate.setHours(0, 0, 0, 0);
      
      const deliveryDate = new Date(orderData.deliveryDate);
      deliveryDate.setHours(0, 0, 0, 0);
      
      // Calculate estimated completion date based on pickup date
      const estimatedCompletionDate = getEstimatedCompletionDate(pickupDate);
      
      // Calculate the minimum allowed delivery date (later of pickup date or estimated completion date)
      const minAllowedDeliveryDate = new Date(Math.max(pickupDate.getTime(), estimatedCompletionDate.getTime()));
      
      // If delivery date is before the minimum allowed date, reset it and show toast
      if (deliveryDate.getTime() < minAllowedDeliveryDate.getTime()) {
        setOrderData((prev: typeof orderData) => ({
          ...prev,
          deliveryDate: undefined
        }));
        
        toast({
          description: "Tanggal pengiriman harus setelah tanggal pengambilan dan estimasi waktu pengerjaan.",
          variant: "destructive"
        });
      }
    }
  }, [orderData.pickupDate, orderData.isDeliveryNeeded]);

  // For delivery pickup date, we can allow today (current day selection)
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Calculate earliest pickup date based on processing time (for self-pickup only)
  const getEarliestPickupDate = () => {
    const now = new Date();
    const processingHours = getMaxProcessingTime();
    
    // Start with the current date
    const earliest = new Date(now);
    
    // For processing times of 24 hours or more, add the appropriate number of days
    if (processingHours >= 24) {
      // Calculate how many days to add (round up)
      const daysToAdd = Math.ceil(processingHours / 24);
      earliest.setDate(earliest.getDate() + daysToAdd);
    } else {
      // For same-day processing (less than 24 hours), add the hours
      earliest.setTime(earliest.getTime() + (processingHours * 60 * 60 * 1000));
    }
    
    // Set to start of day for cleaner comparison
    earliest.setHours(0, 0, 0, 0);
    
    return earliest;
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Selection - Left side */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pilih Pelanggan</h3>
                <CustomerSelect
                  onSelectCustomer={handleCustomerSelect}
                  selectedCustomerId={orderData.customerId}
                />
              </div>
              
              {/* Service Selection - Right side */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pilih Layanan</h3>
                <ServiceSelect
                  onSelectServices={handleServiceSelect}
                  selectedItems={orderData.items}
                  disabled={!orderData.customerId}
                />
                {!orderData.customerId && (
                  <div className="text-sm text-amber-600 mt-2">
                    Silakan pilih pelanggan terlebih dahulu untuk memilih layanan
                  </div>
                )}
              </div>
            </div>
            
            {/* Continue Button */}
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleNext}
                disabled={!orderData.customerId || orderData.items.length === 0}
                className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
              >
                Lanjutkan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: Order Summary */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="overflow-hidden border border-blue-100 shadow-sm">
                  <CardHeader className="bg-blue-50 border-b border-blue-100 pb-2">
                    <CardTitle className="text-lg flex items-center text-blue-700">
                      <ClipboardCheck className="h-5 w-5 mr-2 text-blue-500" />
                      Ringkasan Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <OrderSummary 
                      customerName={orderData.customerName}
                      items={orderData.items}
                      total={orderData.total}
                    />
                  </CardContent>
                </Card>
                
                {/* Processing Time Info */}
                <div className="bg-blue-50 rounded-lg overflow-hidden border border-blue-200 shadow-sm">
                  <div className="flex items-start p-4">
                    <div className="flex-shrink-0 mr-4">
                      <div className="bg-blue-100 p-2.5 rounded-full">
                        <ClockIcon className="h-5 w-5 text-blue-700" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-800">Waktu proses estimasi:</h4>
                      <div className="mt-1 text-blue-900 font-bold text-lg">{getFormattedProcessingTime()}</div>
                      <p className="mt-1 text-blue-800 text-sm">
                        Pengiriman dapat dilakukan setelah {getFormattedProcessingTime()} dari tanggal pengambilan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column: Forms */}
              <div className="lg:col-span-2 space-y-5">
                <Card className="shadow-sm border border-blue-100">
                  <CardHeader className="pb-2 border-b border-blue-100">
                    <CardTitle className="text-lg flex items-center text-blue-700">
                      <TruckIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Opsi Pengiriman
                    </CardTitle>
                    <CardDescription>Pilih metode pengambilan/pengiriman pesanan</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5">
                    {/* Delivery Options */}
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="delivery-option" className="font-medium flex items-center text-blue-700 text-sm">
                          <TruckIcon className="h-4 w-4 mr-1 text-blue-500" />
                          Metode Pengiriman
                        </Label>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOrderData((prev: typeof orderData) => ({
                                ...prev,
                                isDeliveryNeeded: false
                              }));
                            }}
                            className={`flex items-center px-3 py-2 rounded-md text-sm flex-1 cursor-pointer ${
                              !orderData.isDeliveryNeeded 
                                ? 'bg-blue-100 border border-blue-300 text-blue-800' 
                                : 'bg-gray-100 border border-gray-300 text-gray-700'
                            }`}
                          >
                            <HomeIcon className="h-4 w-4 mr-2 text-blue-600" />
                            Diambil Sendiri
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOrderData((prev: typeof orderData) => ({
                                ...prev,
                                isDeliveryNeeded: true
                              }));
                            }}
                            className={`flex items-center px-3 py-2 rounded-md text-sm flex-1 cursor-pointer ${
                              orderData.isDeliveryNeeded 
                                ? 'bg-indigo-100 border border-indigo-300 text-indigo-800' 
                                : 'bg-gray-100 border border-gray-300 text-gray-700'
                            }`}
                          >
                            <TruckIcon className="h-4 w-4 mr-2 text-indigo-600" />
                            Antar ke Alamat
                          </button>
                        </div>
                      </div>
                      
                      {/* Conditionally render date selectors based on delivery method */}
                      {!orderData.isDeliveryNeeded ? (
                        // If self-pickup, show only the pickup date
                        <div className="space-y-2">
                          <Label htmlFor="pickup-date" className="font-medium flex items-center text-blue-700 text-sm">
                            <CalendarIcon className="h-4 w-4 mr-1 text-blue-500" />
                            Tanggal Pengambilan
                          </Label>
                          <Popover open={selfPickupCalendarOpen} onOpenChange={setSelfPickupCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                id="pickup-date"
                                variant="outline"
                                className="w-full justify-start text-left font-normal border-blue-200 focus:ring-blue-400 cursor-pointer"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                {orderData.pickupDate ? (
                                  format(new Date(orderData.pickupDate), "PPP", { locale: id })
                                ) : (
                                  "Pilih tanggal pengambilan"
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4 rounded-xl shadow-lg" align="start">
                              <Calendar
                                mode="single"
                                selected={orderData.pickupDate ? new Date(orderData.pickupDate) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    setOrderData((prev: typeof orderData) => ({
                                      ...prev,
                                      pickupDate: date.toISOString()
                                    }));
                                    // Close the popover
                                    setSelfPickupCalendarOpen(false);
                                  }
                                }}
                                initialFocus
                                disabled={isDateDisabled}
                                className="calendar-with-disabled-styles rdp"
                                modifiersClassNames={{
                                  disabled: "rdp-day_disabled",
                                  selected: "rdp-day_selected",
                                  today: "rdp-day_today"
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      ) : (
                        // If delivery, show pickup and delivery dates side by side
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pickup-date" className="font-medium flex items-center text-blue-700 text-sm">
                              <CalendarIcon className="h-4 w-4 mr-1 text-green-500" />
                              Tanggal Pengambilan
                            </Label>
                            <Popover open={deliveryPickupCalendarOpen} onOpenChange={setDeliveryPickupCalendarOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  id="pickup-date"
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal border-green-200 focus:ring-green-400 cursor-pointer"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-green-500" />
                                  {orderData.pickupDate ? (
                                    format(new Date(orderData.pickupDate), "PPP", { locale: id })
                                  ) : (
                                    "Pilih tanggal pengambilan"
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-4 rounded-xl shadow-lg" align="start">
                                <Calendar
                                  mode="single"
                                  selected={orderData.pickupDate ? new Date(orderData.pickupDate) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      setOrderData((prev: typeof orderData) => ({
                                        ...prev,
                                        pickupDate: date.toISOString()
                                      }));
                                      // Close the popover
                                      setDeliveryPickupCalendarOpen(false);
                                    }
                                  }}
                                  initialFocus
                                  disabled={isDateDisabled}
                                  className="calendar-with-disabled-styles rdp"
                                  modifiersClassNames={{
                                    disabled: "rdp-day_disabled",
                                    selected: "rdp-day_selected",
                                    today: "rdp-day_today"
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="delivery-date" className="font-medium flex items-center text-blue-700 text-sm">
                              <CalendarIcon className="h-4 w-4 mr-1 text-indigo-500" />
                              Tanggal Pengiriman
                            </Label>
                            <Popover open={deliveryCalendarOpen} onOpenChange={setDeliveryCalendarOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  id="delivery-date"
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal border-indigo-200 focus:ring-indigo-400 cursor-pointer"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                                  {orderData.deliveryDate ? (
                                    format(new Date(orderData.deliveryDate), "PPP", { locale: id })
                                  ) : (
                                    "Pilih tanggal pengiriman"
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-4 rounded-xl shadow-lg" align="start">
                                <Calendar
                                  mode="single"
                                  selected={orderData.deliveryDate ? new Date(orderData.deliveryDate) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      setOrderData((prev: typeof orderData) => ({
                                        ...prev,
                                        deliveryDate: date.toISOString()
                                      }));
                                      // Close the popover
                                      setDeliveryCalendarOpen(false);
                                    }
                                  }}
                                  initialFocus
                                  disabled={isDeliveryDateDisabled}
                                  className="calendar-with-disabled-styles delivery-calendar rdp"
                                  modifiersClassNames={{
                                    disabled: "rdp-day_disabled",
                                    selected: "rdp-day_selected",
                                    today: "rdp-day_today"
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border border-blue-100">
                  <CardHeader className="pb-2 border-b border-blue-100">
                    <CardTitle className="text-lg flex items-center text-blue-700">
                      <NotebookIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Catatan Tambahan
                    </CardTitle>
                    <CardDescription>Tambahkan informasi yang diperlukan untuk pesanan ini</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="order-notes" className="font-medium flex items-center text-blue-700 text-sm">
                          <MessageSquareIcon className="h-4 w-4 mr-1 text-blue-500" />
                          Catatan Pesanan
                        </Label>
                        <Textarea
                          id="order-notes"
                          className="w-full mt-2 resize-none border-blue-200 focus-visible:ring-blue-400"
                          placeholder="Contoh: Pakaian merah diproses terpisah, seragam perlu disetrika rapi, dll."
                          value={orderData.notes}
                          onChange={(e) => setOrderData((prev: typeof orderData) => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="special-requirements" className="font-medium flex items-center text-blue-700 text-sm">
                          <FileTextIcon className="h-4 w-4 mr-1 text-blue-500" />
                          Permintaan Khusus
                        </Label>
                        <Textarea
                          id="special-requirements"
                          className="w-full mt-2 resize-none border-blue-200 focus-visible:ring-blue-400"
                          placeholder="Contoh: Parfum khusus, penanganan ekstra hati-hati, kembalikan hanger, dll."
                          value={orderData.specialRequirements || ''}
                          onChange={(e) => setOrderData((prev: typeof orderData) => ({ 
                            ...prev, 
                            specialRequirements: e.target.value 
                          }))}
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button onClick={() => {
                // Save order details first
                handleOrderDetails(orderData.notes);
                // Then go to next step explicitly
                handleNext();
              }} className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
                Lanjutkan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <OrderConfirmation
            orderData={orderData}
            onConfirm={handleConfirmOrder}
            onBack={handleBack}
            isLoading={isLoading}
            onNotesChange={(notes) => {
              setOrderData((prev: typeof orderData) => ({
                ...prev,
                notes
              }));
            }}
            onSkipPayment={(skip) => {
              setSkipPayment(skip);
            }}
            confirmButtonText={skipPayment ? "Buat Pesanan" : "Lanjut ke Pembayaran"}
          />
        );
      case 3:
        return (
          <div>
            <PaymentStep
              orderData={orderData}
              paymentData={paymentData}
              total={orderData.total}
              onPaymentUpdate={handlePaymentUpdate}
              onPaymentSubmit={handlePaymentSubmit}
              onBack={handleBack}
              isLoading={isLoading}
              error={error}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex justify-center pb-4">
              <div className="rounded-full bg-green-50 p-3">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            
            {createdOrder && (
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Pesanan #{createdOrder.orderNumber}</h3>
                <p className="text-muted-foreground">
                  Dibuat pada: {new Date(createdOrder.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
            )}
            
            <Alert>
              <AlertTitle>Berhasil!</AlertTitle>
              <AlertDescription>
                Pesanan telah berhasil dibuat. Anda dapat melanjutkan dengan proses laundry.
              </AlertDescription>
            </Alert>
            
            {createdOrder && (
              <div className="flex justify-center mt-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`/invoices/${createdOrder.id}/print`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect width="12" height="8" x="6" y="14"></rect>
                  </svg>
                  Cetak Struk
                </Button>
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleReset}>
                Buat Pesanan Baru
              </Button>
              {createdOrder && (
                <Link href={`/orders/${createdOrder.id}`}>
                  <Button>
                    Lihat Detail Pesanan
                  </Button>
                </Link>
              )}
            </div>
          </div>
        );
      default:
        return 'Unknown step';
    }
  };

  // Helper function to get animation class based on direction
  const getAnimationClass = () => {
    return direction === 'forward' ? 'slide-in-right' : 'slide-in-left';
  };

  // Function to clear all order state from localStorage
  const clearAllOrderState = () => {
    if (isBrowser) {
      localStorage.removeItem('orderActiveStep');
      localStorage.removeItem('orderData');
      localStorage.removeItem('orderPaymentData');
      localStorage.removeItem('orderItems');
      localStorage.removeItem('orderSkipPayment');
      localStorage.removeItem('createdOrder');
      
      // Clear any other order-related data that might be in localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('order')) {
          keysToRemove.push(key);
        }
      }
      
      // Remove collected keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('[OrderFlow] All order data cleared from localStorage');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          {/* Horizontal step indicator */}
          <div className="mb-12 px-4 relative">
            
            {/* Background connecting line */}
            <div 
              className="absolute h-[2px] bg-muted-foreground/20" 
              style={{ left: 'calc(100% / 10)', right: 'calc(100% / 10)', top: '24px' }} 
            />
            
            {/* Active connecting line */}
            <div 
              className="absolute h-[2px] bg-blue-500" 
              style={{ 
                left: 'calc(100% / 10)', 
                width: activeStep === 0 
                  ? '0px' 
                  : `calc((100% - (100% / 5)) * ${activeStep / (steps.length - 1)})`,
                top: '24px',
                transition: 'width 0.4s ease-in-out',
              }}
            />
            
            <div className="flex justify-between">
              {steps.map((label, index) => (
                <div 
                  key={`step-${index}`}
                  className="flex flex-col items-center"
                  style={{ width: `${100/steps.length}%` }}
                >
                  {/* Step circle with icon */}
                  <div 
                    className={`flex h-12 w-12 items-center justify-center rounded-full z-10 transition-colors duration-300 ${
                      activeStep > index
                        ? 'bg-green-500 text-white'
                        : activeStep === index
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {activeStep > index ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <div className="flex items-center justify-center">
                        {stepIcons[index]}
                      </div>
                    )}
                  </div>
                  
                  {/* Step label */}
                  <div className="mt-2 text-center w-full px-1">
                    <span 
                      className={`text-sm font-medium ${
                        activeStep === index 
                          ? 'text-blue-500' 
                          : activeStep > index
                            ? 'text-green-500'
                            : 'text-muted-foreground/70'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Only render the current step content */}
          <div className="mt-6 pb-4 transition-all duration-300 ease-in-out overflow-hidden">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">{steps[activeStep]}</h2>
              <p className="text-muted-foreground">
                {activeStep === 0 && "Pilih pelanggan yang akan membuat pesanan"}
                {activeStep === 1 && "Pilih layanan dan tentukan jumlah"}
                {activeStep === 2 && "Tinjau dan konfirmasi pesanan"}
                {activeStep === 3 && "Masukkan informasi pembayaran"}
                {activeStep === 4 && "Pesanan berhasil dibuat"}
              </p>
            </div>
            <div className={getAnimationClass()}>
              {getStepContent()}
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 