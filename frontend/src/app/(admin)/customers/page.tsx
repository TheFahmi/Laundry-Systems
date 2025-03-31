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
  Phone
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
import { formatShortDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { getCustomers, Customer } from "@/api/customers"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <Link href="/customers/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search customers..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                Type
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>All</DropdownMenuItem>
              <DropdownMenuItem>Regular</DropdownMenuItem>
              <DropdownMenuItem>VIP</DropdownMenuItem>
              <DropdownMenuItem>New</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>Manage your customer database and track their activities</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Date Added
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center p-4">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
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
                        <div className="flex flex-col">
                          {customer.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                          <div className="flex items-center text-sm mt-1">
                            <Phone className="mr-2 h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.address || 'N/A'}
                      </TableCell>
                      <TableCell>{customer.createdAt ? formatShortDate(new Date(customer.createdAt)) : 'N/A'}</TableCell>
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
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Showing {customers.length > 0 ? (page - 1) * limit + 1 : 0}-
            {Math.min(page * limit, total)} of {total} customers
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {page} of {totalPages || 1}
            </div>
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
  )
} 