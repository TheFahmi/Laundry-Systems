"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Package, 
  ArrowLeft,
  Loader2,
  RefreshCw,
  FilterIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { formatShortDate, formatRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface RecentActivity {
  id: number;
  type: 'order' | 'payment' | 'customer' | 'service';
  text: string;
  time: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<{
    data: RecentActivity[];
    isLoading: boolean;
    error: string | null;
  }>({
    data: [],
    isLoading: true,
    error: null
  });

  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate random cache buster
  const generateCacheBuster = () => {
    return `_cb=${Date.now()}`;
  };

  // Fetch all activities
  const fetchActivities = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else if (!refresh && activities.isLoading === false) {
      setActivities(prev => ({ ...prev, isLoading: true }));
    }

    try {
      // Use a higher limit for viewing all activities
      const response = await fetch(`/api/dashboard/recent-activity?limit=100&${generateCacheBuster()}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Activities data received:', responseData);
      
      // Extract data from property data if it exists
      const activitiesData = responseData.data || responseData;
      
      // Ensure data is an array
      let activitiesArray = Array.isArray(activitiesData) ? activitiesData : [];
      
      setActivities({
        data: activitiesArray,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      setActivities({
        data: [],
        isLoading: false,
        error: error.message || "Failed to load activities"
      });
    } finally {
      if (refresh) {
        setIsRefreshing(false);
      }
    }
  };
  
  useEffect(() => {
    fetchActivities();
  }, []);

  // Filter activities based on type
  const filteredActivities = activities.data.filter(activity => {
    if (filter === "all") return true;
    return activity.type === filter;
  });

  // Paginate the activities
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize));

  // Handle page change
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">Recent Activities</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchActivities(true)}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center space-x-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="order">Orders</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="service">Services</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <span className="text-sm text-muted-foreground">
            Showing {filteredActivities.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredActivities.length)} of {filteredActivities.length} activities
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Complete history of all system activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activities.error ? (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load activities: {activities.error}
              </AlertDescription>
            </Alert>
          ) : paginatedActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities found
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
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
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
