'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container, Typography, Button, Box, Paper, Grid } from '@mui/material';
import Image from 'next/image';
import { APP_NAME } from '@/config';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke /dashboard jika sudah login
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" component="h1" gutterBottom>
              {APP_NAME}
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              Solusi lengkap untuk bisnis laundry Anda. Kelola pelanggan, pesanan, 
              dan pembayaran dengan mudah serta pantau bisnis Anda secara real-time.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => router.push('/login')}
                sx={{ mr: 2 }}
              >
                Masuk
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => router.push('/register')}
              >
                Daftar
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'center',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Image
                src="/assets/laundry-hero.jpg"
                alt="Laundry Management System"
                width={500}
                height={300}
                style={{ borderRadius: 8 }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
