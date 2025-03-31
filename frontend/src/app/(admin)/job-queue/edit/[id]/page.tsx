"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { toast } from "sonner"
import { getJobQueueById, updateJobQueue, deleteJobQueue } from "@/api/job-queue"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Define the form schema
const formSchema = z.object({
  queuePosition: z.coerce.number().int().positive(),
  estimatedCompletionTime: z.string().optional(),
  actualCompletionTime: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export default function EditJobQueuePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [jobQueueItem, setJobQueueItem] = useState<any>(null)

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      queuePosition: 0,
      estimatedCompletionTime: "",
      actualCompletionTime: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (id) {
      fetchJobQueueItem(id)
    } else {
      toast.error("No job queue ID provided")
      router.push("/job-queue")
    }
  }, [id, router])

  const fetchJobQueueItem = async (jobId: string) => {
    try {
      setLoading(true)
      const data = await getJobQueueById(jobId)
      setJobQueueItem(data)
      
      // Format times for form input with proper error handling
      let estimatedTime = ""
      if (data.estimatedCompletionTime) {
        try {
          const date = new Date(data.estimatedCompletionTime)
          if (!isNaN(date.getTime())) {
            estimatedTime = format(date, "HH:mm")
          }
        } catch (error) {
          console.error("Error formatting estimated completion time:", error)
        }
      }
      
      let actualTime = ""
      if (data.actualCompletionTime) {
        try {
          const date = new Date(data.actualCompletionTime)
          if (!isNaN(date.getTime())) {
            actualTime = format(date, "HH:mm")
          }
        } catch (error) {
          console.error("Error formatting actual completion time:", error)
        }
      }
      
      // Set form values
      form.reset({
        queuePosition: data.queuePosition,
        estimatedCompletionTime: estimatedTime,
        actualCompletionTime: actualTime,
        notes: data.notes || "",
      })
    } catch (error) {
      console.error("Error fetching job queue item:", error)
      toast.error("Failed to load job queue data")
      router.push("/job-queue")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitting(true)
      
      // Format times for API submission
      const submitData: any = { ...values }
      
      // If form values are empty strings, convert to undefined to avoid validation errors
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === "") {
          submitData[key] = undefined;
        }
      });
      
      // Safely handle estimatedCompletionTime
      if (values.estimatedCompletionTime && jobQueueItem?.scheduledDate) {
        try {
          const [hours, minutes] = values.estimatedCompletionTime.split(':')
          const estimatedDate = new Date(jobQueueItem.scheduledDate)
          estimatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
          // Verify the date is valid before setting it
          if (!isNaN(estimatedDate.getTime())) {
            submitData.estimatedCompletionTime = estimatedDate.toISOString()
          } else {
            submitData.estimatedCompletionTime = undefined
          }
        } catch (error) {
          console.error("Error formatting estimated completion time:", error)
          submitData.estimatedCompletionTime = undefined
        }
      }
      
      // Safely handle actualCompletionTime
      if (values.actualCompletionTime && jobQueueItem?.scheduledDate) {
        try {
          const [hours, minutes] = values.actualCompletionTime.split(':')
          const actualDate = new Date(jobQueueItem.scheduledDate)
          actualDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
          // Verify the date is valid before setting it
          if (!isNaN(actualDate.getTime())) {
            submitData.actualCompletionTime = actualDate.toISOString()
          } else {
            submitData.actualCompletionTime = undefined
          }
        } catch (error) {
          console.error("Error formatting actual completion time:", error)
          submitData.actualCompletionTime = undefined
        }
      }
      
      await updateJobQueue(id, submitData)
      toast.success("Job queue entry updated successfully")
      router.push("/job-queue")
    } catch (error) {
      console.error("Error updating job queue entry:", error)
      toast.error("Failed to update job queue entry")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) {
      toast.error("Job queue entry ID is missing")
      return
    }
    
    if (confirm("Are you sure you want to delete this job queue entry?")) {
      try {
        setSubmitting(true)
        await deleteJobQueue(id)
        toast.success("Job queue entry deleted successfully")
        router.push("/job-queue")
      } catch (error) {
        console.error("Error deleting job queue entry:", error)
        toast.error("Failed to delete job queue entry")
        setSubmitting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Job Queue Entry</h1>
          <p className="text-muted-foreground">Loading job queue details...</p>
        </div>
        <Card>
          <CardContent>
            <LoadingIndicator text="Loading job queue details..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Job Queue Entry</h1>
          <p className="text-muted-foreground">
            Update job queue details for order {jobQueueItem?.order?.orderNumber}
          </p>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleDelete}
          disabled={submitting}
        >
          Delete Job Queue Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Queue Details</CardTitle>
          <CardDescription>
            Edit details for the job scheduled on {
              jobQueueItem?.scheduledDate 
                ? format(new Date(jobQueueItem.scheduledDate), "dd MMMM yyyy")
                : "loading date..."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="queuePosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Queue Position</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Position in the daily queue
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
                    <FormLabel>Estimated Completion Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Estimated time when this job will be completed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualCompletionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Completion Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      The actual time when the job was completed
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
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special notes for this job"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Additional notes about this job
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
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <LoadingSpinner size="sm" className="mr-2" />}
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 