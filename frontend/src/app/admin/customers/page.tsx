"use client"

import React, { useState, useEffect } from "react"
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Download,
  UserPlus,
  Mail,
  Phone,
  PlusCircle
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
  DropdownMenuCheckboxItem
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
import { formatShortDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { getCustomers, Customer } from "@/api/customers"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import CustomerForm from "@/components/customers/CustomerForm"

// Customer type badge variations
const customerTypeVariants = {
  regular: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  vip: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  new: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterActiveOnly, setFilterActiveOnly] = useState(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const response = await getCustomers({
          page,
          limit,
          search: searchQuery
        })
        
        // Check if the response has the expected structure
        if (response?.data?.items) {
          setCustomers(response.data.items)
          setTotal(response.data.total)
        } else {
          console.error('Unexpected API response structure:', response)
          toast.error('Failed to load customer data')
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        toast.error('Failed to load customer data')
      } finally {
        setLoading(false)
      }
    }

    // Debounce search input to prevent too many API calls
    const timerId = setTimeout(() => {
      fetchCustomers()
    }, 500)

    return () => clearTimeout(timerId)
  }, [page, limit, searchQuery])

  // Handle pagination
  const totalPages = Math.ceil(total / limit)
  const handlePreviousPage = () => setPage(prev => Math.max(prev - 1, 1))
  const handleNextPage = () => setPage(prev => prev < totalPages ? prev + 1 : prev)

  const handleAddCustomer = async (customerData: any) => {
    try {
      setIsSubmitting(true)
      const response = await getCustomers({
        page,
        limit,
        search: searchQuery
      })
      
      // Check if the response has the expected structure
      if (response?.data?.items) {
        setCustomers(response.data.items)
        setTotal(response.data.total)
      } else {
        console.error('Unexpected API response structure:', response)
        toast.error('Failed to load customer data')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customer data')
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayedCustomers = customers.filter(customer => {
    if (filterActiveOnly) {
      return customer.active
    }
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer list
          </p>
        </div>
        <Button onClick={() => setIsAddingCustomer(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Customer
        </Button>
      </div>

      {/* Dialog for adding new customer */}
      <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your database
            </DialogDescription>
          </DialogHeader>
          <CustomerForm 
            onSubmit={handleAddCustomer} 
            onCancel={() => setIsAddingCustomer(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Customer list card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            View and manage all your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filterActiveOnly}
                  onCheckedChange={setFilterActiveOnly}
                >
                  Active Customers Only
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Customers table */}
          {loading ? (
            <LoadingIndicator />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{customer.name}</span>
                              <span className="text-xs text-muted-foreground">{customer.id}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3" />
                            {customer.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3" />
                            {customer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.address || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {customer.active ? <Badge className={customerTypeVariants.regular}>Regular</Badge> : <Badge className={customerTypeVariants.vip}>VIP</Badge>}
                        </TableCell>
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
                                <Link href={`/customers/${customer.id}`} className="w-full">
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/customers/edit/${customer.id}`} className="w-full">
                                  Edit customer
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Link href={`/orders/new?customerId=${customer.id}`} className="w-full">
                                  Create new order
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/orders?customerId=${customer.id}`} className="w-full">
                                  View order history
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination controls */}
          <div className="flex items-center justify-end space-x-2 py-4">
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
        </CardContent>
      </Card>
    </div>
  )
} 