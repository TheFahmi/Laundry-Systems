import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Extract search params
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('reportType') || 'daily';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build URL for backend request
    let backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/reports?`;
    
    if (reportType) {
      backendUrl += `reportType=${reportType}`;
    }
    
    if (startDate) {
      backendUrl += `&startDate=${startDate}`;
    }
    
    if (endDate) {
      backendUrl += `&endDate=${endDate}`;
    }
    
    // Get auth token
    let token = await getAuthToken();
    
    // For development - use a placeholder token if not available
    if (!token) {
      console.warn('No token found - using development placeholder token');
      token = process.env.NEXT_PUBLIC_DEV_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYxNjEyMjM3MSwiZXhwIjoxNjQ3NjU4MzcxfQ.5JVRlUUHKPGl8YkPMCxfsPGpNkGqLvlf2h0iLoGnRvQ";
    }
    
    // Fall back to direct API response if backend is not available
    // This is for development only and should be removed in production
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return NextResponse.json(getMockReportData(reportType));
    }
    
    // Call the backend API
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      // Try to get the error message from the response
      let errorMessage = 'Failed to fetch report data';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If parsing the error response fails, use the default message
      }
      
      // If backend is unavailable in development, use mock data
      if (process.env.NODE_ENV === 'development' && 
          (response.status === 503 || response.status === 404 || response.status === 401)) {
        console.warn('Backend unavailable, using mock data for development');
        return NextResponse.json(getMockReportData(reportType));
      }
      
      return NextResponse.json(
        { message: errorMessage },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching report data:', error);
    
    // In development, return mock data if an error occurs
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error occurred, using mock data for development');
      return NextResponse.json(getMockReportData('daily'));
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock data for development
function getMockReportData(reportType: string): any {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);
  
  // Adjust dates based on report type
  if (reportType === 'weekly') {
    startDate.setDate(today.getDate() - 7);
  } else if (reportType === 'monthly') {
    startDate.setDate(1); // First day of the month
    endDate.setMonth(today.getMonth() + 1, 0); // Last day of the month
  }
  
  // Create daily revenue data
  const dailyRevenue = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dailyRevenue.push({
      date: currentDate.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 500000) + 100000, // Between 100k and 600k
      orders: Math.floor(Math.random() * 10) + 1, // Between 1 and 10
      weight: parseFloat((Math.random() * 5 + 1).toFixed(2)), // Between 1 and 6 kg
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    totalOrders: dailyRevenue.reduce((sum, day) => sum + day.orders, 0),
    totalRevenue: dailyRevenue.reduce((sum, day) => sum + day.revenue, 0),
    totalWeight: dailyRevenue.reduce((sum, day) => sum + day.weight, 0),
    averageOrderValue: Math.round(
      dailyRevenue.reduce((sum, day) => sum + day.revenue, 0) / 
      dailyRevenue.reduce((sum, day) => sum + day.orders, 0)
    ),
    topServices: [
      {
        serviceName: 'Cuci Express',
        totalOrders: 45,
        totalRevenue: 2250000,
        totalWeight: 35.5,
      },
      {
        serviceName: 'Cuci Reguler',
        totalOrders: 38,
        totalRevenue: 1900000,
        totalWeight: 42.8,
      },
      {
        serviceName: 'Setrika',
        totalOrders: 25,
        totalRevenue: 750000,
        totalWeight: 28.2,
      },
      {
        serviceName: 'Dry Cleaning',
        totalOrders: 15,
        totalRevenue: 1050000,
        totalWeight: 12.5,
      },
      {
        serviceName: 'Sepatu',
        totalOrders: 8,
        totalRevenue: 400000,
        totalWeight: 0,
      },
    ],
    dailyRevenue,
  };
} 