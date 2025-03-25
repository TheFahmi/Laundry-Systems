import React from 'react';
import { Chip, ChipProps } from '@mui/material';

// Mendefinisikan tipe status yang valid
export type StatusType = 'placed' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'on-hold';

// Props untuk komponen StatusBadge
interface StatusBadgeProps {
  status: StatusType;
  size?: ChipProps['size'];
}

// Komponen StatusBadge untuk menampilkan status pesanan dengan warna yang sesuai
export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  // Menentukan label berdasarkan status
  const getLabel = (): string => {
    switch (status) {
      case 'placed':
        return 'Pesanan Dibuat';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'processing':
        return 'Diproses';
      case 'ready':
        return 'Siap Diambil';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'on-hold':
        return 'Ditahan';
      default:
        return 'Tidak Diketahui';
    }
  };
  
  // Menentukan warna berdasarkan status
  const getColor = (): ChipProps['color'] => {
    switch (status) {
      case 'placed':
        return 'default';
      case 'confirmed':
        return 'primary';
      case 'processing':
        return 'info';
      case 'ready':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'on-hold':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <Chip
      label={getLabel()}
      color={getColor()}
      size={size}
      sx={{ 
        fontWeight: 500,
        minWidth: 80,
        textAlign: 'center'
      }}
    />
  );
} 