'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, TruckIcon, HomeIcon, NotebookIcon, FileTextIcon, MessageSquareIcon, AlertCircleIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { id } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import DatePickerSheet from '../DatePickerSheet';

// Import Indonesian holidays
import { INDONESIAN_HOLIDAYS } from '@/lib/holidays';

interface OrderDetailsProps {
  orderData: any;
  updateOrderData: (data: any) => void;
}

export default function OrderDetails({ orderData, updateOrderData }: OrderDetailsProps) {
  const [notes, setNotes] = useState(orderData.notes || '');
  const [specialRequirements, setSpecialRequirements] = useState(orderData.specialRequirements || '');
  const [isDeliveryNeeded, setIsDeliveryNeeded] = useState(orderData.isDeliveryNeeded || false);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    orderData.pickupDate ? new Date(orderData.pickupDate) : undefined
  );
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    orderData.deliveryDate ? new Date(orderData.deliveryDate) : undefined
  );
  
  // State for date picker sheets
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);

  // Get maximum processing time from all services in the order
  const getMaxProcessingTime = () => {
    if (!orderData.items || orderData.items.length === 0) return 24; // Default 24 hours

    // Map service types to estimated processing times (in hours)
    const processingTimes = {
      "cuci-setrika": 48, // 2 days for washing and ironing
      "cuci-lipat": 36,   // 1.5 days for washing and folding
      "setrika": 24,      // 1 day for ironing only
      "dry-clean": 72     // 3 days for dry cleaning
    };

    // Find the maximum processing time among all items
    let maxTime = 24; // Default minimum processing time (24 hours)
    
    for (const item of orderData.items) {
      const serviceType = item.serviceType || "default";
      const serviceTime = processingTimes[serviceType as keyof typeof processingTimes] || 24;
      maxTime = Math.max(maxTime, serviceTime);
    }
    
    return maxTime;
  };

  // Calculate the earliest possible pickup date based on processing time
  const getEarliestPickupDate = () => {
    const processingHours = getMaxProcessingTime();
    const now = new Date();
    return addDays(now, Math.ceil(processingHours / 24));
  };

  // Calculate estimated completion date based on pickup date + processing time
  const getEstimatedCompletionDate = (pickupDate: Date) => {
    const processingHours = getMaxProcessingTime();
    // Create a new date object to avoid modifying the original
    const estimatedDate = new Date(pickupDate);
    return addDays(estimatedDate, Math.ceil(processingHours / 24));
  };

  // Suggest a pickup date (earliest date + 0 days)
  const suggestPickupDate = () => {
    return getEarliestPickupDate();
  };

  // Suggest a delivery date (pickup date + processing time)
  const suggestDeliveryDate = () => {
    if (pickupDate) {
      return getEstimatedCompletionDate(pickupDate);
    }
    // Fallback to earliest date + 1 day if no pickup date
    return addDays(getEarliestPickupDate(), 1);
  };

  // Initialize dates if not set
  useEffect(() => {
    if (!pickupDate) {
      setPickupDate(suggestPickupDate());
    }
    
    if (isDeliveryNeeded && !deliveryDate) {
      setDeliveryDate(suggestDeliveryDate());
    }
  }, [isDeliveryNeeded]);

  // Add an effect to reset delivery date if it becomes invalid
  useEffect(() => {
    if (isDeliveryNeeded && pickupDate && deliveryDate) {
      const pickupTime = pickupDate.getTime();
      const deliveryTime = deliveryDate.getTime();
      
      // Calculate estimated completion date based on pickup date
      const estimatedCompletionDate = getEstimatedCompletionDate(pickupDate);
      const estimatedCompletionTime = estimatedCompletionDate.getTime();
      
      // Calculate the minimum allowed delivery date (later of pickup date or estimated completion date)
      const minAllowedDeliveryTime = Math.max(pickupTime, estimatedCompletionTime);
      
      // If delivery date is before the minimum allowed date, reset it
      if (deliveryTime < minAllowedDeliveryTime) {
        setDeliveryDate(undefined);
      }
    }
  }, [pickupDate, isDeliveryNeeded]);

  // Update order data when form values change
  useEffect(() => {
    updateOrderData({
      notes,
      specialRequirements,
      isDeliveryNeeded,
      pickupDate: pickupDate?.toISOString(),
      deliveryDate: isDeliveryNeeded ? deliveryDate?.toISOString() : undefined
    });
  }, [notes, specialRequirements, isDeliveryNeeded, pickupDate, deliveryDate, updateOrderData]);

  // Format the processing time for display
  const formatProcessingTime = () => {
    const hours = getMaxProcessingTime();
    const days = Math.ceil(hours / 24);
    return `${days} hari`;
  };

  // Handle pickup date selection
  const handlePickupDateSelect = (date: Date) => {
    setPickupDate(date);
    // If delivery date exists but is now invalid (before pickup date),
    // reset delivery date
    if (isDeliveryNeeded && deliveryDate) {
      const minDeliveryDate = getEstimatedCompletionDate(date);
      if (deliveryDate < minDeliveryDate) {
        setDeliveryDate(undefined);
      }
    }
  };

  // Handle delivery date selection
  const handleDeliveryDateSelect = (date: Date) => {
    setDeliveryDate(date);
  };

  return (
    <div className="space-y-6">
      {/* Processing time alert */}
      <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
        <div className="flex items-start">
          <AlertCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <AlertDescription className="text-blue-800">
            Estimasi waktu pengerjaan: <strong>{formatProcessingTime()}</strong>. 
            Pengiriman paling cepat adalah <strong className="text-blue-700">{formatProcessingTime()}</strong> setelah tanggal pengambilan.
          </AlertDescription>
        </div>
      </Alert>
      
      {/* Delivery options */}
      <div className="space-y-3">
        <div className="flex items-center mb-1">
          <TruckIcon className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-base font-semibold">Opsi Pengiriman</h3>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">
              Metode Pengiriman
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsDeliveryNeeded(false)}
                className={`flex items-center px-3 py-2 rounded-md text-sm flex-1 ${
                  !isDeliveryNeeded 
                    ? 'bg-blue-100 border border-blue-300 text-blue-800' 
                    : 'bg-gray-100 border border-gray-300 text-gray-700'
                }`}
              >
                <HomeIcon className="h-4 w-4 mr-2 text-blue-600" />
                Diambil Sendiri
              </button>
              <button
                type="button"
                onClick={() => setIsDeliveryNeeded(true)}
                className={`flex items-center px-3 py-2 rounded-md text-sm flex-1 ${
                  isDeliveryNeeded 
                    ? 'bg-indigo-100 border border-indigo-300 text-indigo-800' 
                    : 'bg-gray-100 border border-gray-300 text-gray-700'
                }`}
              >
                <TruckIcon className="h-4 w-4 mr-2 text-indigo-600" />
                Antar ke Alamat
              </button>
            </div>
          </div>
          
          {/* Pickup date selector */}
          <div className="space-y-2 mt-3">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 text-green-600 mr-2" />
              <h4 className="text-sm font-medium">Tanggal Pengambilan</h4>
            </div>
            <Button
              variant="outline"
              className={`w-full justify-between border-green-200 bg-green-50/70 hover:bg-green-100 text-left font-normal h-10 px-3 ${!pickupDate ? 'text-muted-foreground' : ''}`}
              onClick={() => setShowPickupDatePicker(true)}
            >
              {pickupDate ? (
                format(pickupDate, "EEEE, dd MMMM yyyy", { locale: id })
              ) : (
                <span>Pilih tanggal pengambilan</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </div>
          
          {/* Delivery date selector */}
          {isDeliveryNeeded && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-indigo-600 mr-2" />
                <h4 className="text-sm font-medium">Tanggal Pengiriman</h4>
              </div>
              <Button
                variant="outline"
                className={`w-full justify-between border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left font-normal h-10 px-3 ${!deliveryDate ? 'text-muted-foreground' : ''}`}
                onClick={() => setShowDeliveryDatePicker(true)}
                disabled={!pickupDate}
              >
                {deliveryDate ? (
                  format(deliveryDate, "EEEE, dd MMMM yyyy", { locale: id })
                ) : (
                  <span>{pickupDate ? 'Pilih tanggal pengiriman' : 'Pilih tanggal pengambilan dahulu'}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Notes */}
      <div className="space-y-3">
        <div className="flex items-center mb-1">
          <FileTextIcon className="h-5 w-5 text-amber-600 mr-2" />
          <h3 className="text-base font-semibold">Catatan</h3>
        </div>
        <Textarea
          placeholder="Tambahkan catatan untuk pesanan ini..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="border-amber-200 bg-amber-50/50 focus-visible:ring-amber-300"
        />
      </div>
      
      {/* Special requirements */}
      <div className="space-y-3">
        <div className="flex items-center mb-1">
          <MessageSquareIcon className="h-5 w-5 text-cyan-600 mr-2" />
          <h3 className="text-base font-semibold">Permintaan Khusus</h3>
        </div>
        <Textarea
          placeholder="Tambahkan permintaan khusus (opsional)..."
          value={specialRequirements}
          onChange={(e) => setSpecialRequirements(e.target.value)}
          rows={3}
          className="border-cyan-200 bg-cyan-50/50 focus-visible:ring-cyan-300"
        />
      </div>

      {/* Date Picker Sheets */}
      <DatePickerSheet
        isOpen={showPickupDatePicker}
        onClose={() => setShowPickupDatePicker(false)}
        onSelect={handlePickupDateSelect}
        selectedDate={pickupDate}
        minDate={getEarliestPickupDate()}
        title="Pilih Tanggal Pengambilan"
        description="Pilih tanggal pengambilan pesanan"
        holidayDates={INDONESIAN_HOLIDAYS}
      />

      <DatePickerSheet
        isOpen={showDeliveryDatePicker && !!pickupDate}
        onClose={() => setShowDeliveryDatePicker(false)}
        onSelect={handleDeliveryDateSelect}
        selectedDate={deliveryDate}
        minDate={pickupDate ? getEstimatedCompletionDate(pickupDate) : undefined}
        title="Pilih Tanggal Pengiriman"
        description="Pilih tanggal pengiriman pesanan"
        minIntervalAfterDate={pickupDate ? {
          date: pickupDate,
          days: Math.ceil(getMaxProcessingTime() / 24)
        } : undefined}
        holidayDates={INDONESIAN_HOLIDAYS}
      />
    </div>
  );
} 