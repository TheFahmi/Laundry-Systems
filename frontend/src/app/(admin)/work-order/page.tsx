'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Types and API
import { WorkOrder, WorkOrderStatus } from '@/types/work-order';
import { getWorkOrders } from '@/api/work-order';

export default function WorkOrderPage() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkOrders();
  }, [date, filter]);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const data = await getWorkOrders(formattedDate, filter);
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast.error('Failed to load work order data');
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const goToAddWorkOrder = () => {
    router.push(`/work-order/create?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const goToEditWorkOrder = (id: string) => {
    router.push(`/work-order/${id}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage your work orders and track their progress
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <DatePicker
            date={date}
            onDateChange={(newDate) => setDate(newDate || new Date())}
            className="w-full sm:w-auto"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                {filter ? `Filter: ${filter}` : 'Filter'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter(null)}>
                All Work Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('PENDING')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('IN_PROGRESS')}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('COMPLETED')}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('CANCELLED')}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={goToAddWorkOrder}>
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
          <CardDescription>
            Work orders for {format(date, 'dd MMMM yyyy')}
            {filter && ` - Filtered by: ${filter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingIndicator />
          ) : workOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground mb-4">No work orders found</p>
              <Button onClick={goToAddWorkOrder} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Work Order
              </Button>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Current Step</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((workOrder) => (
                    <TableRow key={workOrder.id}>
                      <TableCell>{workOrder.orderNumber}</TableCell>
                      <TableCell>{workOrder.customerName}</TableCell>
                      <TableCell>{workOrder.currentStep}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(workOrder.status)}>
                          {workOrder.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{workOrder.assignedTo || 'Unassigned'}</TableCell>
                      <TableCell>
                        {workOrder.startTime ? format(new Date(workOrder.startTime), 'HH:mm - dd/MM/yy') : 'Not started'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => goToEditWorkOrder(workOrder.id)}
                        >
                          View/Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 