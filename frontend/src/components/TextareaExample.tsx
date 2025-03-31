"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"

interface TextareaExampleProps {
  title?: string
  description?: string
}

export function TextareaExample({ 
  title = "Feedback Form", 
  description = "We'd love to hear your thoughts on our service" 
}: TextareaExampleProps) {
  const [value, setValue] = useState("")
  const [submitted, setSubmitted] = useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitted:", value)
    setSubmitted(true)
    
    // Reset after 3 seconds
    setTimeout(() => {
      setValue("")
      setSubmitted(false)
    }, 3000)
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="feedback">Your feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Type your message here..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={submitted}
              required
              className="min-h-32"
            />
            <p className="text-xs text-muted-foreground">
              Your feedback helps us improve our services.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setValue("")}
            disabled={!value || submitted}
          >
            Clear
          </Button>
          <Button type="submit" disabled={!value || submitted}>
            {submitted ? "Submitted!" : "Submit feedback"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 