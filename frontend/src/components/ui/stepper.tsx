"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Check, CircleDashed, CircleDot } from "lucide-react"

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number
  children: React.ReactNode
}

export function Stepper({ activeStep, children, className, ...props }: StepperProps) {
  const steps = React.Children.toArray(children)

  return (
    <div className={cn("space-y-0", className)} {...props}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null

        return React.cloneElement(child as React.ReactElement<StepProps>, {
          index,
          active: activeStep === index,
          completed: activeStep > index,
          last: index === steps.length - 1,
        })
      })}
    </div>
  )
}

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number
  active?: boolean
  completed?: boolean
  last?: boolean
  children: React.ReactNode
}

export function Step({ 
  index, 
  active, 
  completed, 
  last, 
  children, 
  className, 
  ...props 
}: StepProps) {
  return (
    <div
      className={cn(
        "relative flex pb-8",
        {
          "pb-0": last,
        },
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center mr-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
          {completed ? (
            <Check className="h-5 w-5 text-primary" />
          ) : active ? (
            <CircleDot className="h-5 w-5 text-primary" />
          ) : (
            <CircleDashed className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        {!last && (
          <div className="h-full w-px bg-border dark:bg-muted" />
        )}
      </div>
      <div className="flex-1">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null
          return child
        })}
      </div>
    </div>
  )
}

interface StepLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function StepLabel({ children, className, ...props }: StepLabelProps) {
  return (
    <div className={cn("text-base font-medium", className)} {...props}>
      {children}
    </div>
  )
}

interface StepContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function StepContent({ children, className, ...props }: StepContentProps) {
  return (
    <div className={cn("mt-2", className)} {...props}>
      {children}
    </div>
  )
} 