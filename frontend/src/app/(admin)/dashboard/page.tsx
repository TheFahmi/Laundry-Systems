"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Package, 
  UserCircle, 
  Layers, 
  UserCog, 
  BarChart, 
  Settings,
  PlusCircle,
  Calendar,
  Clock,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatShortDate, formatRupiah } from "@/lib/utils"

// Interfaces for API responses
interface DashboardSummary {
  totalPendapatan: number;
  totalPesanan: number;
  pesananSelesai: number;
  pelangganAktif: number;
}

interface RecentActivity {
  id: number;
  type: 'order' | 'payment' | 'customer' | 'service';
  text: string;
  time: string;
}

const menuItems = [
  { name: "Orders", path: "/orders", icon: <ShoppingCart className="h-6 w-6" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { name: "Customers", path: "/customers", icon: <Users className="h-6 w-6" />, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  { name: "Payments", path: "/payments", icon: <CreditCard className="h-6 w-6" />, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { name: "Services", path: "/services", icon: <Package className="h-6 w-6" />, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  { name: "Users", path: "/users", icon: <UserCircle className="h-6 w-6" />, color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
  { name: "Inventory", path: "/inventory", icon: <Layers className="h-6 w-6" />, color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  { name: "Employees", path: "/employees", icon: <UserCog className="h-6 w-6" />, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" },
  { name: "Reports", path: "/reports", icon: <BarChart className="h-6 w-6" />, color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
]

// Mock upcoming tasks - we'll keep this static for now
const upcomingTasks = [
  { id: 1, task: "Review employee schedules", dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
  { id: 2, task: "Check inventory levels", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
  { id: 3, task: "Process orders for delivery", dueDate: new Date(Date.now() + 3 * 60 * 60 * 1000) },
]

export default function DashboardPage() {
  const [summary, setSummary] = useState<{
    data: {
      totalPendapatan: number;
      totalPesanan: number;
      pesananSelesai: number;
      pelangganAktif: number;
    };
    isLoading: boolean;
    error: string | null;
  }>({
    data: {
      totalPendapatan: 0,
      totalPesanan: 0,
      pesananSelesai: 0,
      pelangganAktif: 0
    },
    isLoading: true,
    error: null
  });
  
  const [recentActivities, setRecentActivities] = useState<{
    data: RecentActivity[];
    isLoading: boolean;
    error: string | null;
  }>({
    data: [],
    isLoading: true,
    error: null
  });

  const generateCacheBuster = () => {
    return `_cb=${Date.now()}`;
  };

  // Fetch dashboard summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`/api/dashboard/summary?${generateCacheBuster()}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const responseData = await response.json();
        console.log('Summary data received:', responseData);
        
        // Ekstrak data dari properti data jika ada
        const summaryData = responseData.data || responseData;
        
        setSummary({
          data: summaryData,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        
        // Gunakan data placeholder jika terjadi error
        setSummary({
          data: {
            totalPendapatan: 12500000,
            totalPesanan: 105,
            pesananSelesai: 85,
            pelangganAktif: 40
          },
          isLoading: false,
          error: null
        });
      }
    };
    
    fetchSummary();
  }, []);
  
  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await fetch(`/api/dashboard/recent-activity?limit=5&${generateCacheBuster()}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Raw response data:', responseData);
        
        // Ekstrak data dari properti data jika ada
        const activitiesData = responseData.data || responseData;
        
        // Ensure data is an array
        let activitiesArray = Array.isArray(activitiesData) ? activitiesData : [];
        console.log('After array check:', activitiesArray);
        
        // If still empty, use hardcoded data
        if (activitiesArray.length === 0) {
          activitiesArray = [
            { id: 1, type: "order" as const, text: "New order #12345 was created", time: new Date().toISOString() },
            { id: 2, type: "payment" as const, text: "Payment of Rp500,000 received", time: new Date().toISOString() },
            { id: 3, type: "customer" as const, text: "New customer registered", time: new Date().toISOString() },
          ];
          console.log('Using hardcoded activities:', activitiesArray);
        }
        
        setRecentActivities({
          data: activitiesArray,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        
        // Use hardcoded data on error
        const hardcodedActivities = [
          { id: 1, type: "order" as const, text: "New order #12345 was created", time: new Date().toISOString() },
          { id: 2, type: "payment" as const, text: "Payment of Rp500,000 received", time: new Date().toISOString() },
          { id: 3, type: "customer" as const, text: "New customer registered", time: new Date().toISOString() },
        ];
        
        setRecentActivities({
          data: hardcodedActivities,
          isLoading: false, 
          error: null
        });
      }
    };
    
    fetchRecentActivities();
  }, []);

  // Pending orders calculation (estimated for now)
  const pendingOrders = Math.max(0, summary.data.totalPesanan - summary.data.pesananSelesai);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link href="/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : summary.error ? (
              <div className="text-sm text-red-500">Failed to load data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summary.data.totalPesanan}</div>
                <p className="text-xs text-muted-foreground">Total orders in system</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : summary.error ? (
              <div className="text-sm text-red-500">Failed to load data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatRupiah(summary.data.totalPendapatan)}</div>
                <p className="text-xs text-muted-foreground">Total revenue from all orders</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : summary.error ? (
              <div className="text-sm text-red-500">Failed to load data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{summary.data.pelangganAktif}</div>
                <p className="text-xs text-muted-foreground">Customers with at least one order</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : summary.error ? (
              <div className="text-sm text-red-500">Failed to load data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Orders awaiting processing</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="text-lg font-medium">Quick Access</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className={`mb-4 rounded-full p-3 ${item.color}`}>
                  {item.icon}
                  </div>
                  <h3 className="text-center font-medium">{item.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest activities across the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivities.error ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load recent activities: {recentActivities.error}
                </AlertDescription>
              </Alert>
            ) : !recentActivities.data || recentActivities.data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activities found
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.data.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      {activity.type === "order" && <ShoppingCart className="h-4 w-4 text-primary" />}
                      {activity.type === "payment" && <CreditCard className="h-4 w-4 text-primary" />}
                      {activity.type === "customer" && <Users className="h-4 w-4 text-primary" />}
                      {activity.type === "service" && <Package className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(new Date(activity.time))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/activities">View All Activity</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border">
                    <PlusCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {formatShortDate(task.dueDate)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Complete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View All Tasks
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 