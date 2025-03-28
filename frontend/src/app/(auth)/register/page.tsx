'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '@/providers/AuthProvider';
import { APP_NAME } from '@/config';

// Interface untuk data form
interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'staff' | 'manager';
}

const steps = ['Buat Akun', 'Informasi Kontak', 'Selesai'];

export default function RegisterPage() {
  const { register } = useAuth();
  
  // State untuk mengetahui apakah komponen sudah di-mount
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'staff'
  });
  
  // Efek untuk menandai bahwa komponen sudah di-mount di sisi klien
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle perubahan input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle langkah selanjutnya
  const handleNext = () => {
    if (activeStep === 0) {
      // Validasi langkah 1 (username dan password)
      if (!formData.username || !formData.password) {
        setError('Username dan password harus diisi');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter');
        return;
      }
    } else if (activeStep === 1) {
      // Validasi langkah 2 (email dan nama)
      if (!formData.email || !formData.name) {
        setError('Email dan nama lengkap harus diisi');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Format email tidak valid');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle langkah sebelumnya
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use the React state formData instead of trying to extract from form elements
      const { username, password, email, name } = formData;

      // Front-end validation
      if (!username || !email || !password || !name) {
        throw new Error('Semua field harus diisi: username, email, password, dan nama');
      }

      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Format email tidak valid');
      }

      console.log('Submitting registration with data:', { username, email, password, name });
      
      // Register using the complete data
      await register(username, password, email, name);
      // Redirect handled in register function
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
      } else {
        setError('Registrasi gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Jika belum dimount (masih di server), tampilkan layout minimal
  if (!mounted) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 4,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              width: '100%',
              borderRadius: 2
            }}
          >
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Daftar Akun {APP_NAME}
            </Typography>
            <Box sx={{ pt: 3, pb: 5 }}></Box>
          </Paper>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 4,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Daftar Akun {APP_NAME}
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="bold">Error:</Typography>
              <Typography variant="body2">{error}</Typography>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Data form: username={formData.username}, 
                email={formData.email}, 
                name={formData.name}, 
                password={formData.password ? '[PROVIDED]' : '[EMPTY]'}
              </Typography>
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            {activeStep === 0 && (
              <React.Fragment>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  autoFocus
                  disabled={loading}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </React.Fragment>
            )}
            
            {activeStep === 1 && (
              <React.Fragment>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoFocus
                  disabled={loading}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Nama Lengkap"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </React.Fragment>
            )}
            
            {activeStep === 2 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Konfirmasi Data
                </Typography>
                <Typography variant="body1">
                  Username: {formData.username}
                </Typography>
                <Typography variant="body1">
                  Email: {formData.email}
                </Typography>
                <Typography variant="body1">
                  Nama: {formData.name}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} disabled={loading}>
                  Kembali
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext} disabled={loading}>
                  Lanjut
                </Button>
              ) : (
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Memproses...' : 'Daftar'}
                </Button>
              )}
            </Box>
            
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
              <Typography variant="body2">
                Sudah punya akun?
              </Typography>
              <Link href="/login" passHref>
                <Typography variant="body2" component="span" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Masuk
                </Typography>
              </Link>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 