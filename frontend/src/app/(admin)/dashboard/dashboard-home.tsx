'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Card, CardContent, 
  Divider, CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import { 
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Payments as PaymentsIcon,
  LocalLaundryService as ServicesIcon
} from '@mui/icons-material';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  getDashboardSummary, getRevenueChart, getServiceDistribution,
  getOrderStatusDistribution
} from '@/api/dashboard';

// Tipe data untuk statistik
interface SummaryData {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  activeOrders: number;
}

// Tipe data untuk grafik pendapatan
interface RevenueData {
  date: string;
  amount: number;
}

// Tipe data untuk distribusi layanan
interface ServiceData {
  name: string;
  count: number;
  percentage: number;
}

// Tipe data untuk distribusi status
interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

export default function DashboardPage() {
  // State untuk data
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  
  // State untuk loading dan error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk periode grafik
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Warna untuk chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Fetch data dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch summary data
        const summary = await getDashboardSummary();
        // Pastikan data sesuai dengan tipe yang diharapkan
        setSummaryData(summary as unknown as SummaryData);
        
        // Fetch revenue chart data
        const revenue = await getRevenueChart({ period });
        setRevenueData(revenue);
        
        // Fetch service distribution
        const services = await getServiceDistribution();
        setServiceData(services);
        
        // Fetch order status distribution
        const statuses = await getOrderStatusDistribution();
        setStatusData(statuses);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Terjadi kesalahan saat mengambil data dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [period]);
  
  // Handle period change
  const handlePeriodChange = (_event: React.SyntheticEvent, newValue: 'daily' | 'weekly' | 'monthly') => {
    setPeriod(newValue);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Tampilkan loading state
  if (loading && !summaryData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Tampilkan error jika ada
  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selamat datang di dashboard admin laundry
        </Typography>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <OrdersIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pesanan Hari Ini
                  </Typography>
                  <Typography variant="h4">
                    {summaryData?.totalOrders || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CustomersIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pelanggan Baru
                  </Typography>
                  <Typography variant="h4">
                    {summaryData?.totalCustomers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentsIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pendapatan Hari Ini
                  </Typography>
                  <Typography variant="h4">
                    {summaryData ? formatCurrency(summaryData.totalRevenue) : 'Rp 0'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ServicesIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Layanan Aktif
                  </Typography>
                  <Typography variant="h4">
                    {summaryData?.activeOrders || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Pendapatan
              </Typography>
              <Tabs
                value={period}
                onChange={handlePeriodChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{ minHeight: 'auto' }}
              >
                <Tab label="Harian" value="daily" />
                <Tab label="Mingguan" value="weekly" />
                <Tab label="Bulanan" value="monthly" />
              </Tabs>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    tickFormatter={(value) => new Intl.NumberFormat('id-ID').format(value)} 
                  />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(value as number)}`, 'Pendapatan']}
                    labelFormatter={(label) => `Tanggal: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Pendapatan"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Service Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Layanan Populer
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} pesanan`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Order Status Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribusi Status Pesanan
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} pesanan`, 'Jumlah']}
                    labelFormatter={(label) => `Status: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Jumlah Pesanan">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 