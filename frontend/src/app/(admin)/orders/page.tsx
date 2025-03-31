"use client"

import React, { useState, useEffect } from "react"
import { 
  ArrowUpDown, 
  ChevronDown, 
  MoreHorizontal, 
  Plus, 
  Filter,
  Download,
  Search,
  LogIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatRupiah, formatShortDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getOrders, updateOrderStatus, Order, OrderStatus } from "@/lib/orders"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { authApi } from "@/utils/api"
import { useAuth } from '@/providers/AuthProvider'

// Status badge variations
const statusVariants = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  washing: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  drying: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
  folding: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  ready: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  delivered: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("")
  const [loading, setLoading] = useState(false)
  
  // Status update dialog
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("")
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Login dialog
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  // Add authentication state check
  const { isAuthenticated } = useAuth();
  
  // Handle login for testing
  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      })
      return
    }
    
    setIsLoggingIn(true)
    try {
      const response = await authApi.login(username, password)
      
      toast({
        title: "Login Successful",
        description: "You are now logged in.",
      })
      
      setIsLoginDialogOpen(false)
      
      // Refresh orders
      fetchOrdersData()
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Login Failed",
        description: "Check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Fetch orders when parameters change
  useEffect(() => {
    fetchOrdersData()
  }, [page, limit, searchQuery, statusFilter])
  
  const fetchOrdersData = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (statusFilter) {
        params.status = statusFilter
      }
      
      const response = await getOrders(params)
      
      // Extract the items and total by navigating through the response
      // Try various paths to find the items array
      let items = null
      let total = 0
      
      // Try to extract items from deeply nested structure
      if (response?.data?.data?.data?.items && Array.isArray(response.data.data.data.items)) {
        items = response.data.data.data.items
        total = response.data.data.data.total || 0
      }
      // Try data.data.items
      else if (response?.data?.data?.items && Array.isArray(response.data.data.items)) {
        items = response.data.data.items
        total = response.data.data.total || 0
      }
      // Try data.items directly
      else if (response?.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items
        total = response.data.total || 0
      }
      
      if (items) {
        setOrders(items)
        setTotalOrders(total)
      } else {
        // Handle case where response doesn't match expected format
        console.warn("Response format not as expected:", response)
        setOrders([])
        setTotalOrders(0)
        toast({
          title: "Data Format Issue",
          description: "The server returned data in an unexpected format.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      setOrders([])
      setTotalOrders(0)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again or check your connection.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle status filter
  const handleStatusFilter = (status: OrderStatus | "") => {
    setStatusFilter(status)
    setPage(1) // Reset to first page when filtering
  }

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page * limit < totalOrders) {
      setPage(page + 1)
    }
  }
  
  // Open update status dialog
  const openUpdateDialog = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setIsUpdateDialogOpen(true)
  }
  
  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) {
      return;
    }
    
    setIsUpdating(true);
    try {
      const response = await updateOrderStatus(selectedOrder.id, newStatus as OrderStatus);
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: newStatus as OrderStatus } 
          : order
      ));
      
      toast({
        title: "Status Updated",
        description: `Order ${selectedOrder.orderNumber} status updated to ${newStatus}`,
      });
      
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <div className="flex gap-2">
          {/* {!isAuthenticated && (
            <Button variant="outline" onClick={() => setIsLoginDialogOpen(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )} */}
          <Link href="/orders/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders..." 
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
            </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusFilter("")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("new")}>New</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("processing")}>Processing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("washing")}>Washing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("drying")}>Drying</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("folding")}>Folding</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("ready")}>Ready</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("delivered")}>Delivered</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Manage your orders and track their status</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="py-10 text-center">Loading orders...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customer.name || `Customer ${order.customerId}`}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {order.items?.slice(0, 3).map((item) => (
                            <Badge key={item.id} variant="outline" className="whitespace-nowrap">
                              {item.serviceName}
                            </Badge>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <Badge variant="outline">+{order.items.length - 3} more</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusVariants[order.status as keyof typeof statusVariants]}
                          variant="secondary"
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatShortDate(new Date(order.createdAt))}</TableCell>
                      <TableCell className="text-right">{formatRupiah(order.totalAmount)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link href={`/orders/${order.id}`} className="w-full">
                                View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openUpdateDialog(order)}>
                              Update status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Print invoice</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Cancel order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Showing <strong>{orders.length}</strong> of <strong>{totalOrders}</strong> orders
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
              disabled={page * limit >= totalOrders}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="washing">Washing</SelectItem>
                <SelectItem value="drying">Drying</SelectItem>
                <SelectItem value="folding">Folding</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Enter your credentials to access the orders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLoginDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 