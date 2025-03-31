"use client"

import React, { useState, useEffect } from "react"
import {
  Calendar,
  Download,
  BarChart4,
  PieChart,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatRupiah } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { toast } from "sonner"
import { generateReport, ReportResponse, ReportType } from "@/api/reports"
import { format, parseISO, subDays } from "date-fns"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{label: string, type: ReportType}>({
    label: "This Month",
    type: ReportType.MONTHLY
  })
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchReport()
  }, [dateRange])
  
  const fetchReport = async () => {
    try {
      setLoading(true)
      
      // Prepare params based on dateRange
      const params: any = {
        reportType: dateRange.type
      }
      
      // If custom date range, add startDate and endDate
      if (dateRange.type === ReportType.CUSTOM) {
        // Example: Last 7 days
        const endDate = new Date()
        const startDate = subDays(endDate, 7)
        
        params.startDate = format(startDate, "yyyy-MM-dd'T'HH:mm:ss'Z'")
        params.endDate = format(endDate, "yyyy-MM-dd'T'HH:mm:ss'Z'")
      }
      
      const reportData = await generateReport(params)
      setReport(reportData)
    } catch (error) {
      console.error("Error fetching report:", error)
      toast.error("Failed to load report data")
      setReport(null)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDateRangeChange = (label: string, type: ReportType) => {
    setDateRange({ label, type })
  }
  
  // Download report as CSV
  const downloadReportCSV = () => {
    if (!report) return
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"
    
    // Add headers
    csvContent += "Date,Revenue,Orders,Weight\n"
    
    // Add daily revenue data
    report.dailyRevenue.forEach(day => {
      csvContent += `${day.date},${day.revenue},${day.orders},${day.weight}\n`
    })
    
    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `laundry-report-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    
    // Click the link to trigger download
    link.click()
  }
  
  // Format date safely
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A"
    try {
      return format(typeof dateString === 'string' ? new Date(dateString) : dateString, "MMM d, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            An overview of your business performance and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-between">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.label}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDateRangeChange("Today", ReportType.DAILY)}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateRangeChange("This Week", ReportType.WEEKLY)}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateRangeChange("This Month", ReportType.MONTHLY)}>
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateRangeChange("Last 7 Days", ReportType.CUSTOM)}>
                Last 7 Days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={downloadReportCSV} disabled={!report}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingIndicator text="Loading report data..." />
      ) : !report ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">No report data available</p>
              <Button onClick={fetchReport} className="mt-4">Retry</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalOrders || 0}</div>
                <div className="text-xs text-muted-foreground">
                  {report.period ? (
                    <>During {formatDate(report.period.start)} - {formatDate(report.period.end)}</>
                  ) : (
                    "No period data available"
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatRupiah(report.totalRevenue || 0)}</div>
                <div className="text-xs text-muted-foreground">
                  {report.dailyRevenue?.length || 0} day period
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Order Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatRupiah(report.averageOrderValue || 0)}</div>
                <div className="text-xs text-muted-foreground">
                  Per order average
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Weight
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(report.totalWeight || 0).toFixed(1)} kg</div>
                <div className="text-xs text-muted-foreground">
                  Total processed
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Revenue analytics */}
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenue Analytics</CardTitle>
                    <CardDescription>
                      Revenue trends over time
                      {report.period && (
                        <> - {formatDate(report.period.start)} to {formatDate(report.period.end)}</>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] overflow-y-auto pr-2">
                  <div className="h-full w-full">
                    {report.dailyRevenue && report.dailyRevenue.length > 0 ? (
                      <div className="space-y-2">
                        {report.dailyRevenue
                          .filter(day => day.revenue > 0 || day.orders > 0)
                          .slice(0, 15)
                          .map((day) => (
                          <div key={day.date} className="flex items-center gap-2">
                            <div className="w-20 text-xs">{format(parseISO(day.date), "dd MMM")}</div>
                            <div className="flex-1 min-w-0">
                              <div className="h-4 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{
                                    width: `${Math.min(100, ((day.revenue / (report.totalRevenue || 1)) * 100) * 3)}%`
                                  }}
                                />
                              </div>
                            </div>
                            <div className="w-24 text-xs text-right font-medium truncate">
                              {formatRupiah(day.revenue)}
                            </div>
                            <div className="w-16 text-xs text-right text-muted-foreground">
                              {day.orders} order{day.orders !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ))}
                        
                        {report.dailyRevenue.length > 15 && (
                          <div className="text-center mt-4 text-xs text-muted-foreground">
                            Showing active days only. See table below for full details.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No daily data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Services</CardTitle>
                    <CardDescription>
                      Services by revenue
                    </CardDescription>
                  </div>
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topServices && report.topServices.length > 0 ? (
                    report.topServices.map((service) => {
                      // Calculate percentage of total revenue
                      const percentage = Math.round((service.totalRevenue / (report.totalRevenue || 1)) * 100)
                      
                      return (
                        <div key={service.serviceName} className="flex items-center">
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium">{service.serviceName}</p>
                              <span className="text-sm text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground">{service.totalOrders} orders</span>
                              <span className="text-xs font-medium">{formatRupiah(service.totalRevenue)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No service data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Daily breakdown table */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Breakdown</CardTitle>
              <CardDescription>
                Detailed daily performance during the period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left text-sm font-medium">Date</th>
                      <th className="py-3 px-4 text-right text-sm font-medium">Orders</th>
                      <th className="py-3 px-4 text-right text-sm font-medium">Revenue</th>
                      <th className="py-3 px-4 text-right text-sm font-medium">Weight (kg)</th>
                      <th className="py-3 px-4 text-right text-sm font-medium">Avg. Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dailyRevenue && report.dailyRevenue.length > 0 ? (
                      report.dailyRevenue.map((day) => (
                        <tr key={day.date} className="border-b">
                          <td className="py-3 px-4 text-sm">{format(parseISO(day.date), "dd MMM yyyy")}</td>
                          <td className="py-3 px-4 text-right text-sm">{day.orders}</td>
                          <td className="py-3 px-4 text-right text-sm font-medium">{formatRupiah(day.revenue)}</td>
                          <td className="py-3 px-4 text-right text-sm">{day.weight.toFixed(1)}</td>
                          <td className="py-3 px-4 text-right text-sm">
                            {day.orders > 0 ? formatRupiah(day.revenue / day.orders) : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No daily data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50">
                      <td className="py-3 px-4 text-sm font-medium">Total</td>
                      <td className="py-3 px-4 text-right text-sm font-medium">{report.totalOrders || 0}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium">{formatRupiah(report.totalRevenue || 0)}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium">{(report.totalWeight || 0).toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium">{formatRupiah(report.averageOrderValue || 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 