"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Printer, Plus, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getJobQueueByDate, getJobQueuePrintData } from "@/api/job-queue"
import { JobQueueItem } from "@/types/job-queue"
import { toast } from "sonner"
import { LoadingIndicator } from '@/components/ui/loading-indicator'

export default function JobQueuePage() {
  const router = useRouter()
  const [date, setDate] = useState<Date>(new Date())
  const [jobQueueItems, setJobQueueItems] = useState<JobQueueItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobQueueItems()
  }, [date])

  const fetchJobQueueItems = async () => {
    try {
      setLoading(true)
      const formattedDate = format(date, "yyyy-MM-dd")
      const data = await getJobQueueByDate(formattedDate)
      
      // Ensure we have an array, even if the API returns undefined, null, or a non-array object
      setJobQueueItems(Array.isArray(data) ? data : [])
      
      // For debugging - log the actual response format
      console.log("Job queue API response:", data)
    } catch (error) {
      console.error("Error fetching job queue items:", error)
      toast.error("Failed to load job queue data")
      setJobQueueItems([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = async () => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd")
      const printData = await getJobQueuePrintData(formattedDate)
      
      // Create a new window for printing
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        toast.error("Please allow pop-ups to print the job queue")
        return
      }
      
      // Generate HTML content
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Job Queue - ${formattedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 10px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .completion-time { font-weight: bold; }
            .notes { font-style: italic; color: #555; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Laundry Job Queue</h1>
          <h2>Date: ${format(date, "dd MMMM yyyy")}</h2>
          <button onclick="window.print();" style="margin-bottom: 10px; padding: 5px 10px;">Print</button>
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Items</th>
                <th>Weight (kg)</th>
                <th>Est. Completion</th>
                <th>Actual Completion</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${printData.map(item => `
                <tr>
                  <td>${item.queuePosition}</td>
                  <td>${item.orderNumber}</td>
                  <td>${item.customerName || 'N/A'}</td>
                  <td>${item.status}</td>
                  <td>${item.totalItems}</td>
                  <td>${item.totalWeight || 0}</td>
                  <td class="completion-time">${item.estimatedCompletionTime}</td>
                  <td class="completion-time">${item.actualCompletionTime || '-'}</td>
                  <td class="notes">${item.notes || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `)
      
      printWindow.document.close()
    } catch (error) {
      console.error("Error printing job queue:", error)
      toast.error("Failed to generate print data")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500'
      case 'processing': return 'bg-yellow-500'
      case 'washing': return 'bg-cyan-500'
      case 'drying': return 'bg-orange-500'
      case 'folding': return 'bg-indigo-500'
      case 'ready': return 'bg-green-500'
      case 'delivered': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const goToAddJobQueue = () => {
    router.push(`/job-queue/add?date=${format(date, "yyyy-MM-dd")}`)
  }

  const goToEditJobQueue = (id: string) => {
    router.push(`/job-queue/edit/${id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Queue</h1>
          <p className="text-muted-foreground">
            Manage daily job queue and track job progress
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={goToAddJobQueue}>
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Job Queue</CardTitle>
          <CardDescription>
            Job queue for {format(date, "dd MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingIndicator />
          ) : jobQueueItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground mb-4">No job queue items for this date</p>
              <Button onClick={goToAddJobQueue} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Job to Queue
              </Button>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Position</TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Est. Completion</TableHead>
                    <TableHead>Actual Completion</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(jobQueueItems) && jobQueueItems.length > 0 ? (
                    jobQueueItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.queuePosition}</TableCell>
                        <TableCell>{item.order?.orderNumber || "N/A"}</TableCell>
                        <TableCell>{item.order?.customer?.name || "N/A"}</TableCell>
                        <TableCell>
                          {item.order?.status && (
                            <Badge 
                              className={cn("capitalize", getStatusColor(item.order.status))}
                            >
                              {item.order.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.estimatedCompletionTime 
                          ? new Date(item.estimatedCompletionTime).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "TBD"}
                        </TableCell>
                        <TableCell>{item.actualCompletionTime 
                          ? new Date(item.actualCompletionTime).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{item.notes || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => goToEditJobQueue(item.id)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No job queue items found for this date
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 