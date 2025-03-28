"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart } from "@/components/ui/charts";
import { Loader2, TrendingUp, TrendingDown, Star, Clock, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Box, Typography, Paper, Divider, Alert } from "@mui/material";

// Define types
interface TopService {
  serviceName: string;
  totalOrders: number;
  totalRevenue: number;
  totalWeight: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  weight: number;
}

interface ReportData {
  period: {
    start: string;
    end: string;
  };
  totalOrders: number;
  totalRevenue: number;
  totalWeight: number;
  averageOrderValue: number;
  topServices: TopService[];
  dailyRevenue: DailyRevenue[];
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("daily");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate analytics and trends based on report data
  const analytics = useMemo(() => {
    if (!reportData || !reportData.dailyRevenue || reportData.dailyRevenue.length < 2) {
      return null;
    }

    const dailyData = reportData.dailyRevenue;
    const numDays = dailyData.length;
    
    // Calculate trends
    const revenueByDay = dailyData.map(d => d.revenue);
    const ordersByDay = dailyData.map(d => d.orders);
    const weightByDay = dailyData.map(d => d.weight);
    
    // Calculate first half and second half averages for trend detection
    const midPoint = Math.floor(numDays / 2);
    const firstHalfRevenue = revenueByDay.slice(0, midPoint);
    const secondHalfRevenue = revenueByDay.slice(midPoint);
    const firstHalfOrders = ordersByDay.slice(0, midPoint);
    const secondHalfOrders = ordersByDay.slice(midPoint);
    
    const avgFirstHalfRevenue = firstHalfRevenue.reduce((sum, val) => sum + val, 0) / firstHalfRevenue.length;
    const avgSecondHalfRevenue = secondHalfRevenue.reduce((sum, val) => sum + val, 0) / secondHalfRevenue.length;
    const avgFirstHalfOrders = firstHalfOrders.reduce((sum, val) => sum + val, 0) / firstHalfOrders.length;
    const avgSecondHalfOrders = secondHalfOrders.reduce((sum, val) => sum + val, 0) / secondHalfOrders.length;
    
    const revenueTrend = avgSecondHalfRevenue - avgFirstHalfRevenue;
    const ordersTrend = avgSecondHalfOrders - avgFirstHalfOrders;
    
    // Find peak days
    const peakRevenueDay = [...dailyData].sort((a, b) => b.revenue - a.revenue)[0];
    const peakOrdersDay = [...dailyData].sort((a, b) => b.orders - a.orders)[0];
    
    // Identify most profitable service
    const topService = reportData.topServices[0];
    const mostEfficient = [...reportData.topServices]
      .filter(s => s.totalOrders > 0)
      .sort((a, b) => (b.totalRevenue / b.totalOrders) - (a.totalRevenue / a.totalOrders))[0];
    
    // Calculate service distribution
    const totalServiceRevenue = reportData.topServices.reduce((sum, s) => sum + s.totalRevenue, 0);
    const serviceDistribution = reportData.topServices.map(s => ({
      name: s.serviceName,
      percentage: parseFloat(((s.totalRevenue / totalServiceRevenue) * 100).toFixed(1))
    }));
    
    // Calculate performance metrics
    const avgDailyRevenue = revenueByDay.reduce((sum, val) => sum + val, 0) / numDays;
    const avgDailyOrders = ordersByDay.reduce((sum, val) => sum + val, 0) / numDays;
    const avgDailyWeight = weightByDay.reduce((sum, val) => sum + val, 0) / numDays;
    
    // Calculate variance and identify outliers
    const revenueVariance = revenueByDay.reduce((sum, val) => sum + Math.pow(val - avgDailyRevenue, 2), 0) / numDays;
    const revenueStdDev = Math.sqrt(revenueVariance);
    
    const outliers = dailyData.filter(day => 
      Math.abs(day.revenue - avgDailyRevenue) > 2 * revenueStdDev
    );
    
    return {
      revenueTrend,
      ordersTrend,
      peakRevenueDay,
      peakOrdersDay,
      topService,
      mostEfficient,
      serviceDistribution,
      avgDailyRevenue,
      avgDailyOrders,
      avgDailyWeight,
      outliers
    };
  }, [reportData]);

  // Fetch report when tab changes or custom date range is applied
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/reports?reportType=${reportType}`;
      
      if (reportType === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch report');
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType !== 'custom') {
      fetchReport();
    }
  }, [reportType]);

  const handleCustomDateApply = () => {
    if (reportType === 'custom' && startDate && endDate) {
      fetchReport();
    }
  };

  // Create chart data for revenue
  const revenueChartData = reportData?.dailyRevenue.map(item => ({
    name: format(new Date(item.date), 'dd MMM'),
    revenue: item.revenue / 1000, // Convert to thousands for better display
  })) || [];

  // Create chart data for top services
  const topServicesChartData = reportData?.topServices.map(service => ({
    name: service.serviceName,
    revenue: service.totalRevenue / 1000, // Convert to thousands for better display
    orders: service.totalOrders,
  })) || [];
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Laporan Bisnis
          </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs defaultValue="daily" value={reportType} onValueChange={setReportType}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="daily">Harian</TabsTrigger>
            <TabsTrigger value="weekly">Mingguan</TabsTrigger>
            <TabsTrigger value="monthly">Bulanan</TabsTrigger>
            <TabsTrigger value="custom">Kustom</TabsTrigger>
          </TabsList>
          
          {reportType === 'custom' && (
            <div className="flex flex-wrap gap-4 mb-6 items-end">
              <div>
                <p className="text-sm mb-2">Tanggal Mulai</p>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>
              <div>
                <p className="text-sm mb-2">Tanggal Akhir</p>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
              <Button onClick={handleCustomDateApply} disabled={!startDate || !endDate}>
                Terapkan
            </Button>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Memuat laporan...</span>
            </div>
          ) : error ? (
            <div className="bg-destructive/20 p-4 rounded-md text-destructive">
              {error}
            </div>
          ) : reportData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(reportData.period.start), 'dd MMM yyyy')} - {format(new Date(reportData.period.end), 'dd MMM yyyy')}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      Rata-rata: {formatCurrency(reportData.averageOrderValue)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Berat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.totalWeight.toFixed(2)} kg</div>
                    <p className="text-xs text-muted-foreground">
                      {reportData.totalWeight > 0 ? `${(reportData.totalRevenue / reportData.totalWeight).toFixed(2)} per kg` : 'Tidak ada data berat'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Nilai Rata-rata Pesanan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(reportData.averageOrderValue)}</div>
                    <p className="text-xs text-muted-foreground">
                      Per Pesanan
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pendapatan Harian</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {revenueChartData.length > 0 ? (
                      <LineChart 
                        data={revenueChartData}
                        categories={['revenue']}
                        index="name"
                        valueFormatter={(value) => `Rp ${value}k`}
                        yAxisWidth={60}
                        height={300}
                      />
                    ) : (
                      <div className="flex justify-center items-center h-64 text-muted-foreground">
                        Tidak ada data pendapatan harian
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Layanan Teratas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topServicesChartData.length > 0 ? (
                      <BarChart 
                        data={topServicesChartData}
                        categories={['revenue']}
                        index="name"
                        valueFormatter={(value) => `Rp ${value}k`}
                        yAxisWidth={60}
                        height={300}
                      />
                    ) : (
                      <div className="flex justify-center items-center h-64 text-muted-foreground">
                        Tidak ada data layanan
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Analysis Section */}
              {analytics && (
                <div className="mt-6">
                  <h2 className="text-2xl font-bold mb-4">Analisis Bisnis</h2>
        <Divider sx={{ mb: 3 }} />
        
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Trend Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          {analytics.revenueTrend > 0 ? (
                            <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingDown className="mr-2 h-5 w-5 text-red-500" />
                          )}
                          Analisis Tren
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tren Pendapatan</span>
                              <span className={analytics.revenueTrend > 0 ? "text-green-500" : "text-red-500"}>
                                {analytics.revenueTrend > 0 ? "+" : ""}{formatCurrency(analytics.revenueTrend)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                              <div 
                                className={`h-full rounded-full ${analytics.revenueTrend > 0 ? "bg-green-500" : "bg-red-500"}`}
                                style={{ width: `${Math.min(Math.abs(analytics.revenueTrend / analytics.avgDailyRevenue * 100), 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tren Pesanan</span>
                              <span className={analytics.ordersTrend > 0 ? "text-green-500" : "text-red-500"}>
                                {analytics.ordersTrend > 0 ? "+" : ""}{analytics.ordersTrend.toFixed(1)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                              <div 
                                className={`h-full rounded-full ${analytics.ordersTrend > 0 ? "bg-green-500" : "bg-red-500"}`}
                                style={{ width: `${Math.min(Math.abs(analytics.ordersTrend / analytics.avgDailyOrders * 100), 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="mt-4 text-sm">
                            {analytics.revenueTrend > 0 && analytics.ordersTrend > 0 ? (
                              <Alert severity="success" sx={{ mb: 1 }}>
                                Bisnis menunjukkan pertumbuhan yang baik di pendapatan dan jumlah pesanan.
                              </Alert>
                            ) : analytics.revenueTrend < 0 && analytics.ordersTrend < 0 ? (
                              <Alert severity="warning" sx={{ mb: 1 }}>
                                Ada penurunan dalam pendapatan dan jumlah pesanan. Perlu evaluasi lebih lanjut.
                              </Alert>
                            ) : analytics.revenueTrend > 0 ? (
                              <Alert severity="info" sx={{ mb: 1 }}>
                                Pendapatan meningkat meskipun jumlah pesanan menurun, menunjukkan kenaikan nilai rata-rata pesanan.
                              </Alert>
                            ) : (
                              <Alert severity="info" sx={{ mb: 1 }}>
                                Jumlah pesanan meningkat tetapi pendapatan menurun, menunjukkan penurunan nilai rata-rata pesanan.
                              </Alert>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Performance Highlights */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Star className="mr-2 h-5 w-5 text-yellow-500" />
                          Kinerja Terbaik
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Hari dengan Pendapatan Tertinggi</p>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{format(new Date(analytics.peakRevenueDay.date), 'dd MMM yyyy')}</span>
                              <span className="text-green-500 font-semibold">{formatCurrency(analytics.peakRevenueDay.revenue)}</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Hari dengan Pesanan Terbanyak</p>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{format(new Date(analytics.peakOrdersDay.date), 'dd MMM yyyy')}</span>
                              <span className="text-primary font-semibold">{analytics.peakOrdersDay.orders} pesanan</span>
                            </div>
                          </div>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Layanan dengan Pendapatan Tertinggi</p>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{analytics.topService.serviceName}</span>
                              <span className="text-green-500 font-semibold">{formatCurrency(analytics.topService.totalRevenue)}</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Layanan Paling Menguntungkan per Pesanan</p>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{analytics.mostEfficient.serviceName}</span>
                              <span className="text-green-500 font-semibold">
                                {formatCurrency(analytics.mostEfficient.totalRevenue / analytics.mostEfficient.totalOrders)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Service Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Distribusi Pendapatan Layanan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.serviceDistribution.map((service, index) => (
                            <div key={index}>
                              <div className="flex justify-between text-sm">
                                <span>{service.name}</span>
                                <span>{service.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                                <div 
                                  className="bg-primary h-full rounded-full"
                                  style={{ width: `${service.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                          
                          <div className="mt-4 text-sm">
                            {analytics.serviceDistribution[0].percentage > 50 && (
                              <Alert severity="warning" sx={{ mb: 1 }}>
                                Lebih dari 50% pendapatan berasal dari satu layanan. Pertimbangkan untuk melakukan diversifikasi.
                              </Alert>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Anomalies and Opportunities */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                          Anomali & Kesempatan
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analytics.outliers.length > 0 ? (
                          <div>
                            <p className="text-sm mb-2">Hari dengan Pendapatan Di Luar Kebiasaan:</p>
                            {analytics.outliers.map((day, index) => (
                              <div key={index} className="flex justify-between items-center mb-2">
                                <span>{format(new Date(day.date), 'dd MMM yyyy')}</span>
                                <span className={day.revenue > analytics.avgDailyRevenue ? "text-green-500" : "text-red-500"}>
                                  {formatCurrency(day.revenue)}
                                </span>
                              </div>
                            ))}
                            <Alert severity="info" sx={{ mt: 2 }}>
                              Analisis hari-hari ini untuk memahami faktor yang memengaruhi penjualan.
                            </Alert>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm mb-2">Tidak ada anomali pendapatan yang signifikan.</p>
                            <Alert severity="success" sx={{ mb: 2 }}>
                              Pendapatan cukup stabil selama periode yang dipilih.
                            </Alert>
                          </div>
                        )}
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <div>
                          <p className="text-sm font-medium">Rekomendasi:</p>
                          <ul className="text-sm mt-1 space-y-1 list-disc pl-4">
                            {analytics.revenueTrend < 0 && (
                              <li>Pertimbangkan promosi untuk mendorong peningkatan pendapatan</li>
                            )}
                            {analytics.serviceDistribution[0].percentage > 40 && (
                              <li>Lakukan promosi khusus untuk layanan dengan kontribusi lebih rendah</li>
                            )}
                            {analytics.avgDailyOrders > 0 && reportData.averageOrderValue < 50000 && (
                              <li>Tingkatkan nilai pesanan rata-rata dengan penawaran bundling</li>
                            )}
                            <li>Fokus pada {analytics.mostEfficient.serviceName} untuk efisiensi pendapatan terbaik</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detail Layanan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Layanan</th>
                            <th className="text-right py-3 px-4">Pesanan</th>
                            <th className="text-right py-3 px-4">Pendapatan</th>
                            <th className="text-right py-3 px-4">Berat (kg)</th>
                            <th className="text-right py-3 px-4">Pendapatan/Pesanan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.topServices.map((service, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-3 px-4">{service.serviceName}</td>
                              <td className="text-right py-3 px-4">{service.totalOrders}</td>
                              <td className="text-right py-3 px-4">{formatCurrency(service.totalRevenue)}</td>
                              <td className="text-right py-3 px-4">{service.totalWeight.toFixed(2)}</td>
                              <td className="text-right py-3 px-4">
                                {formatCurrency(service.totalOrders > 0 ? service.totalRevenue / service.totalOrders : 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
      </CardContent>
    </Card>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              Pilih jenis laporan untuk melihat data
            </div>
          )}
        </Tabs>
      </Paper>
    </Box>
  );
}

/*
Analisis Bisnis yang ditambahkan:

1. Analisis Tren
   - Memonitor perubahan pendapatan dan jumlah pesanan
   - Visualisasi tren positif dan negatif dengan indikator visual
   - Pesan otomatis berdasarkan tren yang terdeteksi

2. Kinerja Terbaik
   - Identifikasi hari dengan pendapatan dan pesanan tertinggi
   - Highlight layanan dengan kontribusi pendapatan terbesar
   - Identifikasi layanan dengan nilai transaksi tertinggi per pesanan

3. Distribusi Pendapatan Layanan
   - Visualisasi proporsi pendapatan dari setiap layanan
   - Peringatan ketergantungan jika satu layanan mendominasi pendapatan

4. Anomali & Kesempatan
   - Deteksi hari dengan pola pendapatan tidak biasa
   - Rekomendasi otomatis berdasarkan data performa
   - Saran untuk meningkatkan penjualan dan diversifikasi pendapatan
*/ 