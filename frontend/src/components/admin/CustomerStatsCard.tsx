import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  LinearProgress,
  linearProgressClasses,
  styled
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  PersonOutline as PersonOutlineIcon,
  Loop as LoopIcon
} from '@mui/icons-material';

// Mendefinisikan props untuk komponen
interface CustomerStatsCardProps {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  retentionRate: number;
  changePercent: number;
}

// Membuat komponen LinearProgress kustom untuk retention rate
const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
  },
}));

export default function CustomerStatsCard({
  totalCustomers,
  newCustomers,
  activeCustomers,
  retentionRate,
  changePercent
}: CustomerStatsCardProps) {
  // Menentukan warna untuk persentase perubahan
  const changeColor = changePercent >= 0 ? 'success.main' : 'error.main';
  
  // Menentukan icon untuk persentase perubahan
  const ChangeIcon = changePercent >= 0 ? PersonAddIcon : PersonRemoveIcon;
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              Statistik Pelanggan
            </Typography>
            <Typography variant="h3" component="div" fontWeight="bold">
              {totalCustomers}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <ChangeIcon sx={{ color: changeColor, fontSize: 18, mr: 0.5 }} />
              <Typography variant="body2" color={changeColor} fontWeight="medium">
                {changePercent}% {changePercent >= 0 ? 'Kenaikan' : 'Penurunan'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                dari bulan lalu
              </Typography>
            </Box>
          </Box>
          <Box 
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PersonOutlineIcon />
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pelanggan Baru
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {newCustomers}
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pelanggan Aktif
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {activeCustomers}
            </Typography>
          </Box>
        </Stack>
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Tingkat Retensi
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LoopIcon sx={{ fontSize: 14, mr: 0.5, color: 'primary.main' }} />
              <Typography variant="body2" fontWeight="medium">
                {retentionRate}%
              </Typography>
            </Box>
          </Box>
          <BorderLinearProgress variant="determinate" value={retentionRate} />
        </Box>
      </CardContent>
    </Card>
  );
} 