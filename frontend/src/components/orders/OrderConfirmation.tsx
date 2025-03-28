import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Grid, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Service {
  id: string;
  name: string;
  price: number;
  priceModel?: 'per_kg' | 'per_piece' | 'flat_rate';
}

interface OrderConfirmationProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  items: Array<{
    serviceName: string;
    quantity: number;
    price: number;
    subtotal?: number;
    weightBased?: boolean;
    weight?: number;
    service?: Service;
  }>;
  paymentMethod: string;
  paymentAmount: number;
  change: number;
  createdAt: string;
}

export default function OrderConfirmation({
  orderId,
  orderNumber,
  customerName,
  totalAmount,
  items,
  paymentMethod,
  paymentAmount,
  change,
  createdAt
}: OrderConfirmationProps) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan popup untuk mencetak struk');
      return;
    }

    // Create print styles and content
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pesanan #${orderNumber}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              max-width: 80mm;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .details {
              margin-bottom: 15px;
            }
            .details-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            th, td {
              text-align: left;
              padding: 5px 2px;
              border-bottom: 1px dashed #ddd;
            }
            .amount-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
            }
            @media print {
              body {
                width: 80mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">LAUNDRY APP</div>
            <div>Struk Pesanan</div>
          </div>
          
          <div class="details">
            <div class="details-row">
              <span>No. Pesanan:</span>
              <span>${orderNumber}</span>
            </div>
            <div class="details-row">
              <span>Tanggal:</span>
              <span>${format(new Date(createdAt), 'dd MMM yyyy HH:mm', { locale: id })}</span>
            </div>
            <div class="details-row">
              <span>Pelanggan:</span>
              <span>${customerName}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                // Determine if this is a weight-based item
                const isWeightBased = 
                  // First priority: Check by service.priceModel
                  (item.service?.priceModel === 'per_kg') ||
                  // Then check by explicit weightBased flag
                  item.weightBased;
                
                const displayQty = isWeightBased ? `${item.weight || 0.5} kg` : item.quantity;
                const subtotal = item.subtotal || (isWeightBased && item.weight 
                  ? item.price * item.weight 
                  : item.price * item.quantity);
                
                return `
                  <tr>
                    <td>${item.serviceName}</td>
                    <td>${displayQty}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(subtotal)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="amount-row">
            <span>TOTAL:</span>
            <span>Rp ${formatCurrency(totalAmount)}</span>
          </div>
          
          <div class="details">
            <div class="details-row">
              <span>Metode Pembayaran:</span>
              <span>${paymentMethod === 'cash' ? 'Tunai' : 
                     paymentMethod === 'transfer' ? 'Transfer' : 
                     paymentMethod === 'qris' ? 'QRIS' : paymentMethod}</span>
            </div>
            <div class="details-row">
              <span>Dibayar:</span>
              <span>Rp ${formatCurrency(paymentAmount)}</span>
            </div>
            ${paymentMethod === 'cash' ? `
              <div class="details-row">
                <span>Kembalian:</span>
                <span>Rp ${formatCurrency(change)}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Terima kasih telah menggunakan jasa laundry kami!</p>
            <p>Pesanan dapat diambil dengan menunjukkan struk ini.</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  const viewOrderDetails = () => {
    // Only navigate when user clicks the button
    router.push(`/orders/${orderId}`);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Pesanan Berhasil Dibuat!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Pesanan #{orderNumber} telah berhasil dibuat dan pembayaran telah diterima.
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Cetak Struk
          </Button>
          <Button 
            variant="contained" 
            startIcon={<VisibilityIcon />}
            onClick={viewOrderDetails}
          >
            Lihat Detail
          </Button>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }} ref={printRef}>
        <Typography variant="h6" gutterBottom>
          Detail Pesanan #{orderNumber}
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Tanggal:</strong> {format(new Date(createdAt), 'dd MMMM yyyy HH:mm', { locale: id })}
            </Typography>
            <Typography variant="body2">
              <strong>Pelanggan:</strong> {customerName}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Layanan</TableCell>
                <TableCell align="right">Jumlah</TableCell>
                <TableCell align="right">Harga</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => {
                // Determine if this is a weight-based item
                const isWeightBased = 
                  // First priority: Check by service.priceModel
                  (item.service?.priceModel === 'per_kg') ||
                  // Then check by explicit weightBased flag
                  item.weightBased;
                
                const displayQty = isWeightBased ? `${item.weight || 0.5} kg` : item.quantity;
                const subtotal = item.subtotal || (isWeightBased && item.weight 
                  ? item.price * item.weight 
                  : item.price * item.quantity);
                
                return (
                  <TableRow key={index}>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell align="right">{displayQty}</TableCell>
                    <TableCell align="right">Rp {formatCurrency(item.price)}</TableCell>
                    <TableCell align="right">Rp {formatCurrency(subtotal)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rp {formatCurrency(totalAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Metode Pembayaran:</strong> {paymentMethod === 'cash' ? 'Tunai' : 
                paymentMethod === 'transfer' ? 'Transfer' : 
                paymentMethod === 'qris' ? 'QRIS' : paymentMethod}
            </Typography>
            <Typography variant="body2">
              <strong>Jumlah Dibayar:</strong> Rp {formatCurrency(paymentAmount)}
            </Typography>
            {paymentMethod === 'cash' && (
              <Typography variant="body2">
                <strong>Kembalian:</strong> Rp {formatCurrency(change)}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
} 