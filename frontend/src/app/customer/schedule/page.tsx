'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Divider,
  Alert,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Snackbar
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  LocalShipping as ShippingIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { formatDate } from '@/lib/dateAdapter';

// Available time slots
const timeSlots = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '13:00 - 15:00',
  '15:00 - 17:00',
  '17:00 - 19:00'
];

// Sample addresses
const savedAddresses = [
  {
    id: 1,
    label: 'Rumah',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    isDefault: true
  },
  {
    id: 2,
    label: 'Kantor',
    address: 'Jl. Gatot Subroto No. 456, Jakarta Selatan',
    isDefault: false
  }
];

export default function SchedulePage() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Schedule form state
  const [scheduleType, setScheduleType] = useState('pickup');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  
  // Address form state
  const [addressType, setAddressType] = useState('saved');
  const [selectedAddressId, setSelectedAddressId] = useState(savedAddresses[0].id);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    saveForLater: false
  });
  
  // Form validation state
  const [errors, setErrors] = useState({
    date: false,
    timeSlot: false,
    address: false,
    newAddressLabel: false,
    newAddressDetails: false
  });

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate schedule form
      const newErrors = {
        ...errors,
        date: !selectedDate,
        timeSlot: !selectedTimeSlot
      };
      
      setErrors(newErrors);
      
      if (!selectedDate || !selectedTimeSlot) {
        return;
      }
    } else if (activeStep === 1) {
      // Validate address form
      let hasError = false;
      const newErrors = { ...errors };
      
      if (addressType === 'saved' && !selectedAddressId) {
        newErrors.address = true;
        hasError = true;
      } else if (addressType === 'new') {
        if (!newAddress.label.trim()) {
          newErrors.newAddressLabel = true;
          hasError = true;
        }
        if (!newAddress.address.trim()) {
          newErrors.newAddressDetails = true;
          hasError = true;
        }
      }
      
      setErrors(newErrors);
      
      if (hasError) {
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowSuccessMessage(true);
      // Reset form
      setActiveStep(0);
      setSelectedDate(null);
      setSelectedTimeSlot('');
      setNotes('');
      setAddressType('saved');
      setSelectedAddressId(savedAddresses[0].id);
      setNewAddress({
        label: '',
        address: '',
        saveForLater: false
      });
    }, 2000);
  };

  const handleScheduleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleType(event.target.value);
  };

  const handleAddressTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddressType(event.target.value);
  };

  const handleNewAddressChange = (field: string, value: string | boolean) => {
    setNewAddress({
      ...newAddress,
      [field]: value
    });
    
    // Clear error for this field if it exists
    if (field === 'label' && errors.newAddressLabel) {
      setErrors({ ...errors, newAddressLabel: false });
    } else if (field === 'address' && errors.newAddressDetails) {
      setErrors({ ...errors, newAddressDetails: false });
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pilih Jadwal
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Jenis Layanan</FormLabel>
                  <RadioGroup
                    row
                    value={scheduleType}
                    onChange={handleScheduleTypeChange}
                  >
                    <FormControlLabel 
                      value="pickup" 
                      control={<Radio />} 
                      label="Penjemputan" 
                    />
                    <FormControlLabel 
                      value="delivery" 
                      control={<Radio />} 
                      label="Pengantaran" 
                    />
                    <FormControlLabel 
                      value="both" 
                      control={<Radio />} 
                      label="Keduanya" 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Pilih Tanggal"
                  value={selectedDate}
                  onChange={(newDate) => {
                    setSelectedDate(newDate);
                    setErrors({ ...errors, date: false });
                  }}
                  disablePast
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: errors.date,
                      helperText: errors.date ? 'Tanggal harus dipilih' : '',
                      InputProps: {
                        startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />,
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={errors.timeSlot}>
                  <InputLabel id="time-slot-label">Pilih Waktu</InputLabel>
                  <Select
                    labelId="time-slot-label"
                    value={selectedTimeSlot}
                    onChange={(e) => {
                      setSelectedTimeSlot(e.target.value);
                      setErrors({ ...errors, timeSlot: false });
                    }}
                    label="Pilih Waktu"
                    startAdornment={<ScheduleIcon color="action" sx={{ mr: 1 }} />}
                  >
                    {timeSlots.map((slot) => (
                      <MenuItem key={slot} value={slot}>
                        {slot}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.timeSlot && (
                    <Typography variant="caption" color="error">
                      Waktu harus dipilih
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Catatan Tambahan (Opsional)"
                  multiline
                  rows={3}
                  variant="outlined"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Berikan instruksi khusus jika diperlukan"
                />
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                {scheduleType === 'pickup' && 'Kurir kami akan menjemput laundry Anda pada waktu yang ditentukan.'}
                {scheduleType === 'delivery' && 'Kurir kami akan mengantar laundry Anda yang sudah selesai pada waktu yang ditentukan.'}
                {scheduleType === 'both' && 'Kurir kami akan menjemput laundry kotor dan mengantar laundry bersih yang sudah selesai pada waktu yang ditentukan.'}
              </Typography>
            </Alert>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pilih Alamat
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <RadioGroup
                value={addressType}
                onChange={handleAddressTypeChange}
              >
                <FormControlLabel 
                  value="saved" 
                  control={<Radio />} 
                  label="Gunakan alamat tersimpan" 
                />
                
                {addressType === 'saved' && (
                  <Box ml={4} mt={1} mb={2}>
                    <FormControl fullWidth error={errors.address}>
                      <InputLabel id="address-select-label">Pilih Alamat</InputLabel>
                      <Select
                        labelId="address-select-label"
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                        label="Pilih Alamat"
                        startAdornment={<LocationIcon color="action" sx={{ mr: 1 }} />}
                      >
                        {savedAddresses.map((address) => (
                          <MenuItem key={address.id} value={address.id}>
                            {address.label} {address.isDefault && '(Default)'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {selectedAddressId && (
                      <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="body2">
                          {savedAddresses.find(a => a.id === selectedAddressId)?.address}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                )}
                
                <FormControlLabel 
                  value="new" 
                  control={<Radio />} 
                  label="Gunakan alamat baru" 
                />
                
                {addressType === 'new' && (
                  <Box ml={4} mt={1}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Label Alamat"
                          value={newAddress.label}
                          onChange={(e) => handleNewAddressChange('label', e.target.value)}
                          placeholder="Contoh: Rumah, Kantor, dll."
                          error={errors.newAddressLabel}
                          helperText={errors.newAddressLabel ? 'Label alamat harus diisi' : ''}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Detail Alamat"
                          value={newAddress.address}
                          onChange={(e) => handleNewAddressChange('address', e.target.value)}
                          multiline
                          rows={3}
                          placeholder="Masukkan alamat lengkap"
                          error={errors.newAddressDetails}
                          helperText={errors.newAddressDetails ? 'Detail alamat harus diisi' : ''}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={newAddress.saveForLater}
                              onChange={(e) => handleNewAddressChange('saveForLater', e.target.checked)}
                            />
                          }
                          label="Simpan alamat ini untuk digunakan nanti"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </RadioGroup>
            </FormControl>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Konfirmasi Jadwal
            </Typography>
            
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Jenis Layanan
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {scheduleType === 'pickup' && 'Penjemputan'}
                    {scheduleType === 'delivery' && 'Pengantaran'}
                    {scheduleType === 'both' && 'Penjemputan & Pengantaran'}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tanggal
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <CalendarIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {selectedDate ? formatDate(selectedDate, 'dddd, D MMMM YYYY') : ''}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Waktu
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">{selectedTimeSlot}</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Alamat
                  </Typography>
                  <Box display="flex">
                    <LocationIcon fontSize="small" color="primary" sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {addressType === 'saved' 
                          ? savedAddresses.find(a => a.id === selectedAddressId)?.label
                          : newAddress.label}
                      </Typography>
                      <Typography variant="body2">
                        {addressType === 'saved' 
                          ? savedAddresses.find(a => a.id === selectedAddressId)?.address
                          : newAddress.address}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {notes && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" color="textSecondary">
                      Catatan
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Pastikan Anda berada di lokasi pada waktu yang ditentukan. Kurir kami akan menghubungi Anda sebelum tiba.
              </Typography>
            </Alert>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        message="Jadwal berhasil dibuat! Kami akan menghubungi Anda untuk konfirmasi."
      />
      
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Jadwalkan Layanan
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Atur jadwal penjemputan atau pengantaran laundry Anda
        </Typography>
      </Box>
      
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Pilih Jadwal</StepLabel>
          </Step>
          <Step>
            <StepLabel>Pilih Alamat</StepLabel>
          </Step>
          <Step>
            <StepLabel>Konfirmasi</StepLabel>
          </Step>
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          {activeStep > 0 && (
            <Button 
              onClick={handleBack} 
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Kembali
            </Button>
          )}
          
          {activeStep < 2 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Lanjut
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {loading ? 'Memproses...' : 'Buat Jadwal'}
            </Button>
          )}
        </Box>
      </Paper>
      
      <Box textAlign="center">
        <Box display="inline-flex" alignItems="center" sx={{ color: 'text.secondary' }}>
          <InfoIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Butuh bantuan? Hubungi kami di 021-12345678
          </Typography>
        </Box>
      </Box>
    </Box>
  );
} 