'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Stack,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Key as KeyIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import { CustomerService } from '@/services/customer.service';
import type { CustomerProfile } from '@/services/customer.service';
import { useCustomerProfile, useUpdateCustomerProfile, useChangePassword } from '@/services/useCustomerQuery';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CustomerProfile() {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  
  const [formData, setFormData] = useState<CustomerProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    avatarUrl: null,
    loyaltyPoints: 0
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  // Use React Query hooks
  const { 
    data: profileData, 
    isLoading: isProfileLoading, 
    error: profileError 
  } = useCustomerProfile();
  
  const { 
    mutate: updateProfile, 
    isPending: isUpdatingProfile 
  } = useUpdateCustomerProfile();
  
  const { 
    mutate: changePassword, 
    isPending: isChangingPassword 
  } = useChangePassword();
  
  // Set loading from query state
  const loading = isProfileLoading || isUpdatingProfile || isChangingPassword;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await CustomerService.getProfile();
        setProfile(profileData);
        
        // Set form data from profile
        setFormData({
          id: profileData.id || '',
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          joinDate: profileData.joinDate || '',
          avatarUrl: profileData.profileImage || profileData.avatarUrl || null,
          loyaltyPoints: profileData.loyaltyPoints || 0
        });
        
        setError('');
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        
        // In development, use sample data
        if (process.env.NODE_ENV === 'development') {
          const sampleProfile: CustomerProfile = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+62 812 3456 7890',
            address: 'Jl. Sudirman No. 123, Jakarta',
            joinDate: '2023-01-15',
            loyaltyPoints: 250,
            avatarUrl: 'https://i.pravatar.cc/150?img=32'
          };
          
          setProfile(sampleProfile);
          setFormData(sampleProfile);
        }
      }
    };
    
    fetchProfile();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleToggleEditMode = () => {
    if (editMode) {
      // Cancel edit mode, revert changes
      setFormData(profile as CustomerProfile);
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear the error for this field
    setPasswordErrors({
      ...passwordErrors,
      [name]: ''
    });
  };

  const handleSaveProfile = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    try {
      // Use the mutation to update profile
      updateProfile(formData, {
        onSuccess: () => {
          setEditMode(false);
          setSnackbarMessage('Profil berhasil diperbarui');
          setShowSnackbar(true);
        },
        onError: (error: any) => {
          setSnackbarMessage(error.message || 'Gagal memperbarui profil');
          setShowSnackbar(true);
        }
      });
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const validatePasswordForm = () => {
    let isValid = true;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Password saat ini harus diisi';
      isValid = false;
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Password baru harus diisi';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password harus minimal 8 karakter';
      isValid = false;
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password harus diisi';
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Password tidak sama';
      isValid = false;
    }
    
    setPasswordErrors(errors);
    return isValid;
  };

  const handleSavePassword = () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      // Use the mutation to change password
      changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        onSuccess: () => {
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setSnackbarMessage('Password berhasil diperbarui');
          setShowSnackbar(true);
        },
        onError: (error: any) => {
          setSnackbarMessage(error.message || 'Gagal memperbarui password');
          setShowSnackbar(true);
        }
      });
    } catch (err) {
      console.error('Error changing password:', err);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const validateForm = () => {
    const errors = passwordErrors; // Use the existing state
    
    // Any additional validation as needed
    
    return errors;
  };

  if (loading && !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
      
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profil Saya
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Kelola informasi profil untuk keamanan akun
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            sx={{ px: 2 }}
          >
            <Tab label="Informasi Pribadi" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Keamanan" icon={<KeyIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={profile?.profileImage || undefined}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  fontSize: '2.5rem',
                  bgcolor: 'primary.main'
                }}
              >
                {profile?.name ? getInitials(profile.name) : <PersonIcon fontSize="large" />}
              </Avatar>
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom align="center">
                {profile?.name}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
                Member sejak {profile?.joinDate}
              </Typography>
              
              {!editMode && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleToggleEditMode}
                  sx={{ mt: 2 }}
                >
                  Edit Profil
                </Button>
              )}
            </Grid>
            
            <Grid item xs={12} md={8}>
              {editMode ? (
                <Stack spacing={3}>
                  <Typography variant="h6" gutterBottom>
                    Edit Informasi Pribadi
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <MailIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Nomor Telepon"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Alamat"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <LocationIcon color="action" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                    }}
                  />
                  
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={handleToggleEditMode}
                      startIcon={<CloseIcon />}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveProfile}
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Simpan Perubahan'}
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <Stack spacing={3}>
                  <Typography variant="h6" gutterBottom>
                    Informasi Pribadi
                  </Typography>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Nama Lengkap
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <PersonIcon color="action" sx={{ mr: 1.5 }} />
                      <Typography variant="body1">{profile?.name}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Email
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <MailIcon color="action" sx={{ mr: 1.5 }} />
                      <Typography variant="body1">{profile?.email}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Nomor Telepon
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <PhoneIcon color="action" sx={{ mr: 1.5 }} />
                      <Typography variant="body1">{profile?.phone}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Alamat
                    </Typography>
                    <Box display="flex">
                      <LocationIcon color="action" sx={{ mr: 1.5, mt: 0.25 }} />
                      <Typography variant="body1">{profile?.address}</Typography>
                    </Box>
                  </Box>
                </Stack>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={4} maxWidth={600} mx="auto">
            <Typography variant="h6" gutterBottom>
              Ubah Password
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Password Anda harus terdiri dari minimal 8 karakter dan mengandung kombinasi huruf dan angka.
            </Alert>
            
            <TextField
              fullWidth
              label="Password Saat Ini"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              variant="outlined"
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword}
              InputProps={{
                startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            
            <TextField
              fullWidth
              label="Password Baru"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              variant="outlined"
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword}
              InputProps={{
                startAdornment: <LockResetIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            
            <TextField
              fullWidth
              label="Konfirmasi Password Baru"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              variant="outlined"
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword}
              InputProps={{
                startAdornment: <LockResetIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSavePassword}
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Perbarui Password'}
              </Button>
            </Box>
          </Stack>
        </TabPanel>
      </Paper>
    </Box>
  );
} 