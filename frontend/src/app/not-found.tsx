'use client';

import { useEffect } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  // Log the error for debugging
  useEffect(() => {
    console.error('404 Not Found: Current path is not valid');
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2, fontSize: { xs: '4rem', md: '6rem' } }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mb: 4 }}>
          Halaman Tidak Ditemukan
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Halaman yang Anda cari tidak ditemukan atau mungkin telah dipindahkan.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.back()}
            sx={{ px: 3, py: 1 }}
          >
            Kembali
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href="/dashboard"
            sx={{ px: 3, py: 1 }}
          >
            Ke Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 