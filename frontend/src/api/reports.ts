import { createAuthHeaders } from '@/lib/api-utils';

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export interface ReportPeriod {
  start: Date;
  end: Date;
}

export interface TopService {
  serviceName: string;
  totalOrders: number;
  totalRevenue: number;
  totalWeight: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  weight: number;
}

export interface ReportResponse {
  period: ReportPeriod;
  totalOrders: number;
  totalRevenue: number;
  totalWeight: number;
  averageOrderValue: number;
  topServices: TopService[];
  dailyRevenue: DailyRevenue[];
}

export interface GenerateReportDto {
  startDate?: string;
  endDate?: string;
  reportType?: ReportType;
}

// Get API URL from environment or use default
const getApiUrl = () => '/api';

/**
 * Generate a business report based on specified parameters
 * @param params Parameters for report generation (dates and report type)
 * @returns Promise resolving to report data
 */
export async function generateReport(params: GenerateReportDto = {}): Promise<ReportResponse> {
  try {
    const { startDate, endDate, reportType = ReportType.DAILY } = params;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (reportType) queryParams.append('reportType', reportType);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const queryString = queryParams.toString();
    const url = `${getApiUrl()}/reports${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`Failed to generate report: ${errorText}`);
    }
    
    const responseData = await response.json();
    
    // Extract data from nested structure - could be data.data, data, or the raw response
    const reportData = responseData?.data?.data || responseData?.data || responseData;
    
    console.log("Raw API response:", responseData);
    console.log("Extracted report data:", reportData);
    
    // Clean and sanitize the data
    const sanitizedReport: ReportResponse = {
      period: reportData.period,
      totalOrders: Number(reportData.totalOrders) || 0,
      totalRevenue: parseNumberSafely(reportData.totalRevenue) || 0,
      totalWeight: parseNumberSafely(reportData.totalWeight) || 0,
      averageOrderValue: parseNumberSafely(reportData.averageOrderValue) || 0,
      topServices: (reportData.topServices || []).map((service: any) => ({
        serviceName: service.serviceName,
        totalOrders: Number(service.totalOrders) || 0,
        totalRevenue: parseNumberSafely(service.totalRevenue) || 0,
        totalWeight: parseNumberSafely(service.totalWeight) || 0
      })),
      dailyRevenue: (reportData.dailyRevenue || []).map((day: any) => ({
        date: day.date,
        revenue: parseNumberSafely(day.revenue) || 0,
        orders: Number(day.orders) || 0,
        weight: parseNumberSafely(day.weight) || 0
      }))
    };
    
    // Calculate average order value if it's null or NaN
    if (!sanitizedReport.averageOrderValue && sanitizedReport.totalOrders > 0) {
      sanitizedReport.averageOrderValue = sanitizedReport.totalRevenue / sanitizedReport.totalOrders;
    }
    
    return sanitizedReport;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

/**
 * Safely parse a number from a string or number value
 * Handles malformed strings with leading zeros
 */
function parseNumberSafely(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  if (typeof value === 'string') {
    // Remove non-numeric characters except decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    
    // Handle concatenated values like "0060000075000007500"
    if (sanitized.length > 10 && !sanitized.includes('.')) {
      // Attempt to extract the first valid price
      const matches = sanitized.match(/\d{4,7}/g);
      if (matches && matches.length > 0) {
        return Number(matches[0]);
      }
    }
    
    return Number(sanitized);
  }
  
  return 0;
} 