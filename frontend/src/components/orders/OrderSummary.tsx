import React from 'react';
import { Box, Typography, Paper, Divider, Grid } from '@mui/material';

interface Service {
  id: string;
  name: string;
  price: number;
  priceModel?: 'per_kg' | 'per_piece' | 'flat_rate';
}

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

interface OrderSummaryProps {
  orderData: {
    customerId: string;
    customerName: string;
    items: OrderItem[];
    notes?: string;
    total: number;
  };
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderData }) => {
  // Hitung total berdasarkan item yang sesungguhnya (jangan bergantung pada total dari orderData)
  const calculateTotal = () => {
    if (!orderData.items || !Array.isArray(orderData.items)) return 0;
    
    return orderData.items.reduce((sum, item) => {
      // Use the subtotal directly from each item
      return sum + item.subtotal;
    }, 0);
  };
  
  // Nilai total yang benar berdasarkan item
  const actualTotal = calculateTotal();
  
  // Log untuk debugging
  console.log('OrderSummary items:', orderData.items);
  console.log('Calculated total:', actualTotal);
  console.log('Original total:', orderData.total);
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Konfirmasi Pesanan
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Detail Pelanggan
        </Typography>
        <Typography variant="body1">
          {orderData.customerName || 'Tidak ada nama pelanggan'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Item Pesanan
        </Typography>
        
        {orderData.items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Tidak ada item yang ditambahkan
          </Typography>
        ) : (
          <Box>
            {orderData.items.map((item, index) => {
              // Determine if this is a weight-based item based on service priceModel
              const isWeightBased = item.service?.priceModel === 'per_kg';
              
              return (
                <Grid container key={index} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {item.serviceName}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" align="right">
                      {isWeightBased && item.weight !== undefined
                        ? `${item.weight} kg × Rp ${item.price.toLocaleString('id-ID')}`
                        : `${item.quantity} × Rp ${item.price.toLocaleString('id-ID')}`
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" align="right">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </Typography>
                  </Grid>
                </Grid>
              );
            })}
            
            <Divider sx={{ my: 1 }} />
            
            <Grid container>
              <Grid item xs={9}>
                <Typography variant="subtitle2" align="right">
                  Total:
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" align="right">
                  Rp {actualTotal.toLocaleString('id-ID')}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
      
      {orderData.notes && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Catatan
          </Typography>
          <Typography variant="body2">
            {orderData.notes}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default OrderSummary; 