"use client"

import React, { useState } from "react"
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

// Mock revenue data
const revenueData = {
  daily: 1250000,
  weekly: 8750000,
  monthly: 35000000,
  yearToDate: 420000000,
  growth: 12.5
}

// Mock top services data
const topServices = [
  { name: "Cuci Setrika", revenue: 15000000, percentage: 40, orders: 120 },
  { name: "Dry Cleaning", revenue: 10000000, percentage: 25, orders: 45 },
  { name: "Express Laundry", revenue: 7500000, percentage: 20, orders: 60 },
  { name: "Cuci Kering", revenue: 2500000, percentage: 10, orders: 40 },
  { name: "Cuci Sepatu", revenue: 1500000, percentage: 5, orders: 20 }
]

// Mock summary data
const summaryData = {
  totalCustomers: 245,
  customerGrowth: 8.3,
  totalOrders: 985,
  orderGrowth: 15.2,
  totalRevenue: 125000000,
  revenueGrowth: 12.5,
  averageOrderValue: 127000,
  aovGrowth: -2.3
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("This Month")
  
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
                {dateRange}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDateRange("Today")}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("This Week")}>This Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("This Month")}>This Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("Last 3 Months")}>Last 3 Months</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("This Year")}>This Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
            </Button>
            </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {summaryData.customerGrowth > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{summaryData.customerGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{summaryData.customerGrowth}%</span>
                </>
              )}
              <span className="ml-1">from last period</span>
            </div>
                  </CardContent>
                </Card>
                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {summaryData.orderGrowth > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{summaryData.orderGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{summaryData.orderGrowth}%</span>
                </>
              )}
              <span className="ml-1">from last period</span>
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
            <div className="text-2xl font-bold">{formatRupiah(summaryData.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {summaryData.revenueGrowth > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{summaryData.revenueGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{summaryData.revenueGrowth}%</span>
                </>
              )}
              <span className="ml-1">from last period</span>
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
            <div className="text-2xl font-bold">{formatRupiah(summaryData.averageOrderValue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {summaryData.aovGrowth > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{summaryData.aovGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{summaryData.aovGrowth}%</span>
                </>
              )}
              <span className="ml-1">from last period</span>
            </div>
                  </CardContent>
                </Card>
              </div>
              
      {/* Revenue analytics */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-1">
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Revenue trends over time
              </CardDescription>
            </div>
            <div className="ml-auto">
              <BarChart4 className="h-5 w-5 text-muted-foreground" />
            </div>
                  </CardHeader>
                  <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center">
                <BarChart4 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">Revenue Chart</h3>
                <p className="text-sm text-muted-foreground">
                  Chart visualization would appear here
                </p>
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
              {topServices.map((service) => (
                <div key={service.name} className="flex items-center">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{service.name}</p>
                      <span className="text-sm text-muted-foreground">{service.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${service.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{service.orders} orders</span>
                      <span className="text-xs font-medium">{formatRupiah(service.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
                      </div>
                  </CardContent>
                </Card>
              </div>
              
      {/* Report tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
                    <Card>
                      <CardHeader>
              <CardTitle>Business Overview</CardTitle>
              <CardDescription>
                View comprehensive business metrics
              </CardDescription>
                      </CardHeader>
                      <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Business Metrics Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Key metrics visualization would appear here
                  </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
        </TabsContent>
        <TabsContent value="sales" className="mt-6">
                    <Card>
                      <CardHeader>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>
                Detailed breakdown of sales performance
              </CardDescription>
                      </CardHeader>
                      <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Sales Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Sales data visualization would appear here
                  </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
        </TabsContent>
        <TabsContent value="customers" className="mt-6">
                    <Card>
                      <CardHeader>
              <CardTitle>Customer Analysis</CardTitle>
              <CardDescription>
                Insights about customer behavior and demographics
              </CardDescription>
                      </CardHeader>
                      <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Customer Demographics</h3>
                  <p className="text-sm text-muted-foreground">
                    Customer data visualization would appear here
                  </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
        </TabsContent>
        <TabsContent value="inventory" className="mt-6">
                    <Card>
                      <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>
                Monitoring of inventory levels and usage
              </CardDescription>
                      </CardHeader>
                      <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Inventory Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Inventory data visualization would appear here
                  </p>
                </div>
                    </div>
      </CardContent>
    </Card>
        </TabsContent>
      </Tabs>
              </div>
  )
} 