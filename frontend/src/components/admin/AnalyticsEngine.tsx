'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Tipe data untuk kategori laporan
type ReportCategory = 'business' | 'customer' | 'service' | 'capacity';

// Tipe data untuk periode laporan
type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Tipe data untuk parameter formatter pada Tooltip
type FormatterValue = string | number | Array<string | number>;

// Tipe data untuk parameter label pada Pie chart
interface PieLabel {
  name: string;
  percent: number;
  [key: string]: unknown;
}

// Antarmuka untuk analisis prediktif
interface PredictiveAnalytics {
  volumeProjection: {
    period: string;
    actual: number;
    projected: number;
  }[];
  customerCategories: {
    name: string;
    value: number;
    color: string;
  }[];
}

// Data dummy untuk metrik bisnis
const businessMetrics = [
  { month: 'Jan', pendapatan: 12500000, target: 10000000 },
  { month: 'Feb', pendapatan: 15000000, target: 12000000 },
  { month: 'Mar', pendapatan: 13800000, target: 13000000 },
  { month: 'Apr', pendapatan: 16500000, target: 15000000 },
  { month: 'Mei', pendapatan: 18000000, target: 16000000 },
  { month: 'Jun', pendapatan: 17200000, target: 16000000 }
];

// Data dummy untuk perilaku pelanggan
const customerBehaviorData = [
  { bulan: 'Jan', baru: 35, kembali: 42, total: 77 },
  { bulan: 'Feb', baru: 28, kembali: 55, total: 83 },
  { bulan: 'Mar', baru: 32, kembali: 58, total: 90 },
  { bulan: 'Apr', baru: 40, kembali: 63, total: 103 },
  { bulan: 'Mei', baru: 45, kembali: 68, total: 113 },
  { bulan: 'Jun', baru: 38, kembali: 72, total: 110 }
];

// Data dummy untuk pemanfaatan layanan
const serviceUtilizationData = [
  { name: 'Cuci Reguler', value: 35, color: '#0088FE' },
  { name: 'Setrika', value: 25, color: '#00C49F' },
  { name: 'Cuci Express', value: 20, color: '#FFBB28' },
  { name: 'Dry Cleaning', value: 15, color: '#FF8042' },
  { name: 'Layanan Khusus', value: 5, color: '#8884D8' }
];

// Data dummy untuk perencanaan kapasitas
const capacityPlanningData = [
  { hari: 'Senin', volume: 120, kapasitas: 150 },
  { hari: 'Selasa', volume: 90, kapasitas: 150 },
  { hari: 'Rabu', volume: 110, kapasitas: 150 },
  { hari: 'Kamis', volume: 135, kapasitas: 150 },
  { hari: 'Jumat', volume: 160, kapasitas: 150 },
  { hari: 'Sabtu', volume: 180, kapasitas: 200 },
  { hari: 'Minggu', volume: 80, kapasitas: 100 }
];

// Data dummy untuk analisis prediktif
const predictiveAnalyticsData: PredictiveAnalytics = {
  volumeProjection: [
    { period: 'Jul', actual: 320, projected: 0 },
    { period: 'Agu', actual: 0, projected: 350 },
    { period: 'Sep', actual: 0, projected: 380 },
    { period: 'Okt', actual: 0, projected: 420 },
    { period: 'Nov', actual: 0, projected: 480 },
    { period: 'Des', actual: 0, projected: 520 }
  ],
  customerCategories: [
    { name: 'Premium', value: 15, color: '#8884d8' },
    { name: 'Regular', value: 55, color: '#82ca9d' },
    { name: 'Occasional', value: 30, color: '#ffc658' }
  ]
};

export default function AnalyticsEngine() {
  // State untuk tab kategori
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('business');
  
  // State untuk periode laporan
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');
  
  // Menangani perubahan kategori
  const handleCategoryChange = (event: React.SyntheticEvent, newValue: ReportCategory) => {
    setActiveCategory(newValue);
  };
  
  // Menangani perubahan periode
  const handlePeriodChange = (event: SelectChangeEvent<ReportPeriod>) => {
    setReportPeriod(event.target.value as ReportPeriod);
  };
  
  // Render grafik berdasarkan kategori aktif
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'business':
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Kinerja Bisnis - Pendapatan vs Target
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={businessMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value: number) => `Rp ${value / 1000000}jt`} />
                <Tooltip formatter={(value: FormatterValue): [string] => [`Rp ${Number(value).toLocaleString()}`]} />
                <Legend />
                <Bar dataKey="pendapatan" name="Pendapatan" fill="#8884d8" />
                <Bar dataKey="target" name="Target" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Analisis:</strong> Pendapatan telah melebihi target dalam 6 bulan terakhir dengan pertumbuhan rata-rata 8.5% per bulan.
              </Typography>
            </Box>
          </Box>
        );
        
      case 'customer':
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Analisis Perilaku Pelanggan
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerBehaviorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="baru" name="Pelanggan Baru" stroke="#8884d8" />
                <Line type="monotone" dataKey="kembali" name="Pelanggan Kembali" stroke="#82ca9d" />
                <Line type="monotone" dataKey="total" name="Total Pelanggan" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Analisis:</strong> Tingkat retensi pelanggan meningkat sebesar 15% dengan pelanggan yang kembali meningkat secara konsisten.
              </Typography>
            </Box>
          </Box>
        );
        
      case 'service':
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Pemanfaatan Layanan
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceUtilizationData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: PieLabel) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {serviceUtilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: FormatterValue): [string] => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Analisis:</strong> Layanan cuci reguler dan setrika merupakan layanan yang paling banyak digunakan, menghasilkan 60% dari total pendapatan.
              </Typography>
            </Box>
          </Box>
        );
        
      case 'capacity':
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Perencanaan Kapasitas - Volume vs Kapasitas
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={capacityPlanningData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hari" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" name="Volume" fill="#8884d8" />
                <Bar dataKey="kapasitas" name="Kapasitas" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Analisis:</strong> Periode puncak terjadi pada hari Jumat dan Sabtu dengan kapasitas terlampaui pada hari Jumat. Pertimbangkan untuk menambah kapasitas.
              </Typography>
            </Box>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  // Render konten analisis prediktif
  const renderPredictiveAnalytics = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Proyeksi Volume Pesanan
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={predictiveAnalyticsData.volumeProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Volume Aktual" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="projected" name="Proyeksi" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Proyeksi berdasarkan tren historis dan faktor musiman. Ekspektasi peningkatan 63% menjelang akhir tahun.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Kategorisasi Pelanggan
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={predictiveAnalyticsData.customerCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: PieLabel) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {predictiveAnalyticsData.customerCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: FormatterValue): [string] => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Kategorisasi berdasarkan frekuensi kunjungan dan nilai pesanan. Pelanggan regular menyumbang 55% dari total basis pelanggan.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h2">
            Mesin Analitik
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="period-select-label">Periode</InputLabel>
            <Select
              labelId="period-select-label"
              value={reportPeriod}
              label="Periode"
              onChange={handlePeriodChange}
            >
              <MenuItem value="daily">Harian</MenuItem>
              <MenuItem value="weekly">Mingguan</MenuItem>
              <MenuItem value="monthly">Bulanan</MenuItem>
              <MenuItem value="quarterly">Kuartalan</MenuItem>
              <MenuItem value="yearly">Tahunan</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Tabs
          value={activeCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab 
            label="Kinerja Bisnis" 
            value="business" 
            icon={<TrendingUpIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Perilaku Pelanggan" 
            value="customer" 
            icon={<GroupIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Pemanfaatan Layanan" 
            value="service" 
            icon={<PieChartIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Perencanaan Kapasitas" 
            value="capacity" 
            icon={<BarChartIcon />} 
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ mb: 4 }}>
          {renderCategoryContent()}
        </Box>
        
        <Divider sx={{ my: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="subtitle2" color="text.secondary">
              ANALISIS PREDIKTIF
            </Typography>
          </Box>
        </Divider>
        
        {renderPredictiveAnalytics()}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" startIcon={<TimelineIcon />}>
            Lihat Laporan Lengkap
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 