"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  IconButton,
  Divider,
  FormControlLabel,
  Switch,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Save as SaveIcon,
  Close as CancelIcon 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserById, updateUser } from '@/services/userService';
import { FormErrors, UserRole, EditUserFormData, User } from '@/types/user';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<EditUserFormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: UserRole.USER,
    status: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const user = await getUserById(params.id);
        
        setFormData({
          name: user.name,
          email: user.email,
          username: user.username,
          password: '',
          confirmPassword: '',
          role: user.role as UserRole,
          status: user.isActive
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        setError('Failed to load user data. Please try again.');
        setUserNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when field is edited
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.checked
    }));
  };

  const handlePasswordSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangePassword(e.target.checked);
    if (!e.target.checked) {
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation (only if change password is checked)
    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        isValid = false;
      }

      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create API payload - only include password if it was changed
      const userData = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        isActive: formData.status,
        ...(changePassword && formData.password ? { password: formData.password } : {})
      };
      
      await updateUser(params.id, userData);
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/users');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.message || 'Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (userNotFound) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          User not found. The user may have been deleted or the ID is invalid.
        </Alert>
        <Button 
          component={Link} 
          href="/users" 
          variant="contained"
          startIcon={<BackIcon />}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link href="/users" passHref>
          <IconButton color="inherit">
            <BackIcon />
          </IconButton>
        </Link>
        <Typography variant="h4">Edit User</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          User updated successfully!
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>User Information</Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.username}
                helperText={errors.username}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                  required
                >
                  <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                  <MenuItem value={UserRole.STAFF}>Staff</MenuItem>
                  <MenuItem value={UserRole.USER}>Regular User</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={changePassword}
                    onChange={handlePasswordSwitchChange}
                    color="primary"
                  />
                }
                label="Change Password"
              />
            </Grid>

            {changePassword && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="New Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    required={changePassword}
                    error={!!errors.password}
                    helperText={errors.password}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    required={changePassword}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>Status</Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label={formData.status ? "Active" : "Inactive"}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => router.push('/users')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSubmitting || success}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
} 