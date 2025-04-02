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
  Edit,
  Trash,
  ClipboardList
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
import { formatRupiah } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getServices, LaundryService, getServiceCategories } from "@/api/services"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

// Category badge variations
const categoryVariants = {
  regular: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  premium: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  express: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  special: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
}

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [services, setServices] = useState<LaundryService[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getServiceCategories();
        if (response?.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const filters = {
          page,
          limit,
          search: searchQuery,
          ...(selectedCategory && { category: selectedCategory })
        };
        const response = await getServices(filters);
        
        if (response?.data?.items) {
          setServices(response.data.items);
          setTotal(response.data.total);
        } else {
          console.error('Unexpected API response structure:', response);
          toast.error('Failed to load service data');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load service data');
      } finally {
        setLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchServices();
    }, 500);

    return () => clearTimeout(timerId);
  }, [page, limit, searchQuery, selectedCategory]);

  // Handle pagination
  const totalPages = Math.ceil(total / limit);
  const handlePreviousPage = () => setPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage(prev => prev < totalPages ? prev + 1 : prev);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page when changing category
  };

  const getCategoryVariant = (category: string) => {
    return categoryVariants[category as keyof typeof categoryVariants] || categoryVariants.default;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Services</h2>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search services..." 
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
                Category
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCategorySelect(null)}>All</DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.map(category => (
                <DropdownMenuItem key={category} onClick={() => handleCategorySelect(category)}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>Service Management</CardTitle>
          <CardDescription>Manage your laundry services and pricing</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-[250px]" />
                  <Skeleton className="h-12 w-[200px]" />
                  <Skeleton className="h-12 w-[100px]" />
                  <Skeleton className="h-12 w-[100px]" />
                  <Skeleton className="h-12 w-[100px]" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center">
                      Service
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Price
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Duration
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center p-4">
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">{service.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[300px]">{service.description || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatRupiah(service.price)}</div>
                        <div className="text-xs text-muted-foreground">
                          per {service.priceModel === 'per_kg' ? 'kg' : 
                                service.priceModel === 'per_piece' ? 'piece' : 'service'}
                        </div>
                      </TableCell>
                      <TableCell>{service.estimatedTime || service.processingTimeHours || 'N/A'} hours</TableCell>
                      <TableCell>
                        {service.category ? (
                          <Badge
                            className={getCategoryVariant(service.category.toLowerCase())}
                            variant="secondary"
                          >
                            {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Category</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {service.isActive ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
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
                            <DropdownMenuItem asChild>
                              <Link href={`/services/edit/${service.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit service
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/services/${service.id}`}>
                                <ClipboardList className="mr-2 h-4 w-4" />
                                View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => toast.error('Delete functionality not implemented')}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete service
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
            Showing {services.length > 0 ? (page - 1) * limit + 1 : 0}-
            {Math.min(page * limit, total)} of {total} services
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