"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createJobQueue } from "@/api/job-queue"
import { getOrders, Order, OrderStatus } from "@/api/orders"

// Define the form schema
const formSchema = z.object({
  orderId: z.string().uuid({
    message: "Please select an order",
  }),
  scheduledDate: z.string(),
  queuePosition: z.coerce.number().int().positive().optional(),
  estimatedCompletionTime: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export default function AddJobQueuePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: "",
      scheduledDate: dateParam || format(new Date(), "yyyy-MM-dd"),
      queuePosition: undefined,
      estimatedCompletionTime: "",
      notes: "",
    },
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // Fetch all orders and filter out delivered/cancelled ones in the frontend
      const response = await getOrders({
        limit: 100
      });
      
      console.log('API response:', response);
      
      let ordersData: Order[] = [];
      
      // Extract orders from the nested response structure
      if (response?.data?.data?.items && Array.isArray(response.data.data.items)) {
        // This matches the structure in the provided response
        ordersData = response.data.data.items;
      } else if (response?.data && Array.isArray(response.data)) {
        ordersData = response.data;
      }
      
      // Filter out delivered and cancelled orders in the frontend
      const activeOrders = ordersData.filter(order => 
        order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED
      );
      
      console.log('Active orders:', activeOrders);
      setOrders(activeOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      
      // Handle empty strings for optional fields by converting them to null/undefined
      const formattedValues = { 
        ...values,
        estimatedCompletionTime: values.estimatedCompletionTime || undefined,
        notes: values.notes || undefined,
        queuePosition: values.queuePosition || undefined
      };
      
      // Only format the time if it's provided
      if (formattedValues.estimatedCompletionTime) {
        // Combine the scheduled date with the time to create a valid ISO 8601 date
        const [hours, minutes] = formattedValues.estimatedCompletionTime.split(':');
        const scheduledDate = new Date(formattedValues.scheduledDate);
        scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        formattedValues.estimatedCompletionTime = scheduledDate.toISOString();
      }
      
      console.log('Submitting job queue data:', formattedValues);
      await createJobQueue(formattedValues)
      toast.success("Job queue entry added successfully")
      router.push("/job-queue")
    } catch (error) {
      console.error("Error creating job queue entry:", error)
      toast.error("Failed to add job queue entry")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Job to Queue</h1>
        <p className="text-muted-foreground">
          Add a new order to the daily job queue
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Queue Entry</CardTitle>
          <CardDescription>
            Enter details for the new job queue entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.orderNumber} - {order.customer?.name || 'Unknown'} ({order.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the order to add to the job queue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      The date when this job is scheduled
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="queuePosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Queue Position (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Auto-assign if left empty"
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Position in the daily queue (will be auto-assigned if left empty)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedCompletionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Completion Time (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        placeholder="Auto-calculate if left empty"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated time of completion (will be auto-calculated if left empty)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special notes for this job"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes about this job
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/job-queue")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add to Queue"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 