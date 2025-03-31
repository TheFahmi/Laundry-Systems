'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface OrderDetailsProps {
  orderData: any;
  updateOrderData: (data: any) => void;
}

export default function OrderDetails({ orderData, updateOrderData }: OrderDetailsProps) {
  const [notes, setNotes] = useState(orderData.notes || '');
  const [specialRequirements, setSpecialRequirements] = useState(
    orderData.specialRequirements || ''
  );
  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    orderData.pickupDate ? new Date(orderData.pickupDate) : undefined
  );
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    orderData.deliveryDate ? new Date(orderData.deliveryDate) : undefined
  );
  const [isDeliveryNeeded, setIsDeliveryNeeded] = useState<string>(
    orderData.isDeliveryNeeded ? 'yes' : 'no'
  );

  // Calculate suggested pickup date (today + 2 days)
  const getSuggestedPickupDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date;
  };

  // Calculate suggested delivery date (today + 3 days)
  const getSuggestedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  };

  // Update order data when form values change
  useEffect(() => {
    updateOrderData({
      notes,
      specialRequirements,
      pickupDate: pickupDate ? pickupDate.toISOString() : undefined,
      deliveryDate: deliveryDate ? deliveryDate.toISOString() : undefined,
      isDeliveryNeeded: isDeliveryNeeded === 'yes'
    });
  }, [notes, specialRequirements, pickupDate, deliveryDate, isDeliveryNeeded]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Detail Pesanan</h2>
      
      {/* Order Summary */}
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="font-medium">Ringkasan Pesanan</p>
        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
          <div>
            <p className="text-muted-foreground">Pelanggan:</p>
            <p className="font-medium">{orderData.customer?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Item:</p>
            <p className="font-medium">{orderData.items?.length || 0} item</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Berat:</p>
            <p className="font-medium">{orderData.totalWeight?.toFixed(2) || 0} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Harga:</p>
            <p className="font-medium">Rp {orderData.totalAmount?.toLocaleString('id-ID') || 0}</p>
          </div>
        </div>
      </div>
      
      {/* Delivery Options */}
      <div className="space-y-2">
        <Label htmlFor="delivery-option">Opsi Pengiriman</Label>
        <Select 
          value={isDeliveryNeeded} 
          onValueChange={setIsDeliveryNeeded}
        >
          <SelectTrigger id="delivery-option">
            <SelectValue placeholder="Pilih opsi pengiriman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">Diambil Sendiri</SelectItem>
            <SelectItem value="yes">Antar ke Alamat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Pickup Date */}
      <div className="space-y-2">
        <Label htmlFor="pickup-date">Tanggal Pengambilan</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="pickup-date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !pickupDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {pickupDate ? (
                format(pickupDate, "PPP", { locale: id })
              ) : (
                "Pilih tanggal pengambilan"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={pickupDate}
              onSelect={setPickupDate}
              initialFocus
              disabled={(date) => date < new Date()}
            />
            <div className="p-3 border-t">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => setPickupDate(getSuggestedPickupDate())}
              >
                Tanggal yang disarankan
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Delivery Date - Only show if delivery is needed */}
      {isDeliveryNeeded === 'yes' && (
        <div className="space-y-2">
          <Label htmlFor="delivery-date">Tanggal Pengiriman</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="delivery-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !deliveryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deliveryDate ? (
                  format(deliveryDate, "PPP", { locale: id })
                ) : (
                  "Pilih tanggal pengiriman"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deliveryDate}
                onSelect={setDeliveryDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
              <div className="p-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => setDeliveryDate(getSuggestedDeliveryDate())}
                >
                  Tanggal yang disarankan
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          placeholder="Catatan untuk pesanan ini..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      
      {/* Special Requirements */}
      <div className="space-y-2">
        <Label htmlFor="special-requirements">Permintaan Khusus</Label>
        <Textarea
          id="special-requirements"
          placeholder="Permintaan khusus untuk penanganan..."
          value={specialRequirements}
          onChange={(e) => setSpecialRequirements(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
} 