'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// Data dummy untuk segmentasi pelanggan berdasarkan frekuensi
const frequencySegmentData = [
  { name: 'Baru (1x)', value: 45, color: '#8884d8' },
  { name: 'Sesekali (2-4x)', value: 30, color: '#82ca9d' },
  { name: 'Reguler (5-12x)', value: 15, color: '#ffc658' },
  { name: 'Loyal (>12x)', value: 10, color: '#ff8042' }
];

// Data dummy untuk segmentasi berdasarkan nilai
const valueSegmentData = [
  { name: 'Ekonomis (<300rb)', value: 35, color: '#8dd1e1' },
  { name: 'Standar (300rb-1jt)', value: 40, color: '#a4de6c' },
  { name: 'Premium (1jt-3jt)', value: 20, color: '#d0ed57' },
  { name: 'VIP (>3jt)', value: 5, color: '#ffc658' }
];

// Data dummy untuk segmentasi berdasarkan layanan
const serviceSegmentData = [
  { name: 'Cuci Reguler', value: 50, color: '#8884d8' },
  { name: 'Cuci Express', value: 20, color: '#82ca9d' },
  { name: 'Premium', value: 10, color: '#ffc658' },
  { name: 'Laundry Khusus', value: 20, color: '#ff8042' }
];

// Data dummy untuk retensi pelanggan
const retentionData = [
  { month: 'Jan', newCustomers: 30, returning: 20, retention: 67 },
  { month: 'Feb', newCustomers: 25, returning: 23, retention: 77 },
  { month: 'Mar', newCustomers: 20, returning: 18, retention: 72 },
  { month: 'Apr', newCustomers: 35, returning: 25, retention: 71 },
  { month: 'Mei', newCustomers: 40, returning: 32, retention: 80 },
  { month: 'Jun', newCustomers: 30, returning: 28, retention: 93 }
];

// Tipe untuk segmen pelanggan
type SegmentCategory = 'frequency' | 'value' | 'service' | 'retention';

// Tipe untuk periode
type SegmentPeriod = 'monthly' | 'quarterly' | 'yearly';

export default function CustomerSegmentsPage() {
  // State untuk tab kategori
  const [category, setCategory] = useState<SegmentCategory>('frequency');
  
  // State untuk periode
  const [period, setPeriod] = useState<SegmentPeriod>('monthly');
  
  // Handler untuk perubahan kategori
  const handleCategoryChange = (event: React.SyntheticEvent, newValue: SegmentCategory) => {
    setCategory(newValue);
  };
  
  // Handler untuk perubahan periode
  const handlePeriodChange = (event: SelectChangeEvent<SegmentPeriod>) => {
    setPeriod(event.target.value as SegmentPeriod);
  };
  
  const renderCategoryContent = () => {
    switch (category) {
      case 'frequency':
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Segmentasi Berdasarkan Frekuensi Kunjungan
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={frequencySegmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {frequencySegmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Detail Segmentasi Frekuensi
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Segmen</TableCell>
                          <TableCell align="right">Jumlah Pelanggan</TableCell>
                          <TableCell align="right">Persentase</TableCell>
                          <TableCell align="right">Nilai Rata-rata</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Chip label="Baru" size="small" sx={{ bgcolor: '#8884d8', color: 'white' }} />
                          </TableCell>
                          <TableCell align="right">45</TableCell>
                          <TableCell align="right">45%</TableCell>
                          <TableCell align="right">Rp 150.000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip label="Sesekali" size="small" sx={{ bgcolor: '#82ca9d', color: 'white' }} />
                          </TableCell>
                          <TableCell align="right">30</TableCell>
                          <TableCell align="right">30%</TableCell>
                          <TableCell align="right">Rp 350.000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip label="Reguler" size="small" sx={{ bgcolor: '#ffc658', color: 'white' }} />
                          </TableCell>
                          <TableCell align="right">15</TableCell>
                          <TableCell align="right">15%</TableCell>
                          <TableCell align="right">Rp 750.000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip label="Loyal" size="small" sx={{ bgcolor: '#ff8042', color: 'white' }} />
                          </TableCell>
                          <TableCell align="right">10</TableCell>
                          <TableCell align="right">10%</TableCell>
                          <TableCell align="right">Rp 1.250.000</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Rekomendasi Strategi
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Pelanggan Baru (45%)
                        </Typography>
                        <Typography variant="body2">
                          Fokus pada program pengenalan dan edukasi tentang layanan premium. Tawarkan diskon untuk pemesanan kedua untuk mendorong kunjungan berulang.
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Pelanggan Sesekali (30%)
                        </Typography>
                        <Typography variant="body2">
                          Implementasikan program reward untuk meningkatkan frekuensi kunjungan. Kirim pengingat dan promo spesial setiap bulan.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Pelanggan Reguler (15%)
                        </Typography>
                        <Typography variant="body2">
                          Perkenalkan program membership dengan benefit khusus. Berikan akses ke layanan prioritas dan penawaran eksklusif.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Pelanggan Loyal (10%)
                        </Typography>
                        <Typography variant="body2">
                          Tawarkan program VIP dengan pelayanan personal. Pertimbangkan untuk melibatkan mereka dalam program referral dengan insentif menarik.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 'value':
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Segmentasi Berdasarkan Nilai Belanja
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={valueSegmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {valueSegmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Detail Segmentasi Nilai
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Segmen</TableCell>
                          <TableCell align="right">Jumlah Pelanggan</TableCell>
                          <TableCell align="right">Persentase</TableCell>
                          <TableCell align="right">Total Kontribusi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Chip label="Ekonomis" size="small" sx={{ bgcolor: '#8dd1e1', color: 'white' }} />
                          </TableCell>
                          <TableCell align="right">35</TableCell>
                          <TableCell align="right">35%</TableCell>
                          <TableCell align="right">15%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip label="Standar" size="small" sx={{ bgcolor: '#a4de6c', color: 'white' }} />
                          </TableCell>
                          <TableCell align="right">40</TableCell>
                          <TableCell align="right">40%</TableCell>
                          <TableCell align="right">35%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip label="Premium" size="small" sx={{ bgcolor: '#d0ed57', color: 'white' }} />
                          </TableCell>
                          <TableCell align="right">20</TableCell>
                          <TableCell align="right">20%</TableCell>
                          <TableCell align="right">30%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip label="VIP" size="small" sx={{ bgcolor: '#ffc658', color: 'white' }} />
                          </TableCell>
                          <TableCell align="right">5</TableCell>
                          <TableCell align="right">5%</TableCell>
                          <TableCell align="right">20%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'service':
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Segmentasi Berdasarkan Preferensi Layanan
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceSegmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceSegmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Cross-Selling Opportunities
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Segmen Layanan</TableCell>
                          <TableCell>Peluang Cross-Selling</TableCell>
                          <TableCell align="right">Potensi Konversi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Cuci Reguler</TableCell>
                          <TableCell>Layanan Setrika Premium</TableCell>
                          <TableCell align="right">25%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cuci Express</TableCell>
                          <TableCell>Paket Bulanan</TableCell>
                          <TableCell align="right">35%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Premium</TableCell>
                          <TableCell>Laundry Khusus & Perawatan</TableCell>
                          <TableCell align="right">40%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Laundry Khusus</TableCell>
                          <TableCell>Paket VIP</TableCell>
                          <TableCell align="right">15%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 'retention':
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tingkat Retensi Pelanggan
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={retentionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="newCustomers" name="Pelanggan Baru" fill="#8884d8" />
                      <Bar yAxisId="left" dataKey="returning" name="Pelanggan Kembali" fill="#82ca9d" />
                      <Bar yAxisId="right" dataKey="retention" name="Tingkat Retensi (%)" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Penyebab Churn
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Kualitas Layanan', value: 35, color: '#8884d8' },
                          { name: 'Harga', value: 25, color: '#82ca9d' },
                          { name: 'Kompetitor', value: 20, color: '#ffc658' },
                          { name: 'Lokasi', value: 15, color: '#ff8042' },
                          { name: 'Lainnya', value: 5, color: '#a4de6c' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Kualitas Layanan', value: 35, color: '#8884d8' },
                          { name: 'Harga', value: 25, color: '#82ca9d' },
                          { name: 'Kompetitor', value: 20, color: '#ffc658' },
                          { name: 'Lokasi', value: 15, color: '#ff8042' },
                          { name: 'Lainnya', value: 5, color: '#a4de6c' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Strategi Retensi
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      1. Program Loyalitas
                    </Typography>
                    <Typography variant="body2">
                      Implementasikan program poin reward dengan benefit yang jelas untuk meningkatkan retensi sebesar 25%.
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      2. Peningkatan Kualitas
                    </Typography>
                    <Typography variant="body2">
                      Tingkatkan pelatihan staff dan standar QC untuk mengurangi keluhan kualitas sebesar 35%.
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      3. Komunikasi Proaktif
                    </Typography>
                    <Typography variant="body2">
                      Implementasikan notifikasi status dan reminder layanan untuk meningkatkan engagement pelanggan.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      4. Personalisasi Layanan
                    </Typography>
                    <Typography variant="body2">
                      Kembangkan rekomendasi layanan berdasarkan preferensi dan kebutuhan individu pelanggan.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Segmentasi Pelanggan
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="period-select-label">Periode</InputLabel>
            <Select
              labelId="period-select-label"
              value={period}
              label="Periode"
              onChange={handlePeriodChange}
            >
              <MenuItem value="monthly">Bulanan</MenuItem>
              <MenuItem value="quarterly">Kuartalan</MenuItem>
              <MenuItem value="yearly">Tahunan</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Analisis segmentasi pelanggan membantu Anda memahami basis pelanggan dan mengoptimalkan strategi marketing untuk setiap segmen.
        </Typography>
        
        <Tabs
          value={category}
          onChange={handleCategoryChange}
          sx={{ mb: 3 }}
        >
          <Tab label="Berdasarkan Frekuensi" value="frequency" />
          <Tab label="Berdasarkan Nilai" value="value" />
          <Tab label="Berdasarkan Layanan" value="service" />
          <Tab label="Retensi Pelanggan" value="retention" />
        </Tabs>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderCategoryContent()}
      </CardContent>
    </Card>
  );
} 