"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isSameDay, addMonths, subMonths, parseISO, isToday, startOfWeek, endOfWeek,
  addDays, isSunday, getDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  ShoppingCart, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  Calendar as CalendarIcon,
  Loader2,
  RefreshCw,
  FilterIcon,
  Package,
  X
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'order' | 'payment' | 'delivery' | 'reminder';
  status?: string;
  amount?: number;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [filter, setFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);

  // Generate cache buster
  const generateCacheBuster = () => {
    return `_cb=${Date.now()}`;
  };

  // Fetch calendar events
  const fetchEvents = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, we'll use mock data
      // In a real implementation, you would fetch from an API like:
      // const response = await fetch(`/api/calendar/events?${generateCacheBuster()}`);
      
      // Mock data generation - replace with actual API call later
      const orderCount = Math.floor(Math.random() * 10) + 15;
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      // Generate mock events spread across the month
      const mockEvents: Event[] = [];
      
      // Generate order events
      for (let i = 0; i < orderCount; i++) {
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), randomDay);
        const statuses = ['new', 'processing', 'ready', 'completed', 'delivered'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        mockEvents.push({
          id: `order-${i}`,
          title: `Order #${10000 + i}`,
          date: eventDate.toISOString(),
          type: 'order',
          status: randomStatus
        });
        
        // Add a payment event for some orders
        if (Math.random() > 0.3) {
          const paymentDate = new Date(eventDate);
          paymentDate.setHours(paymentDate.getHours() + Math.floor(Math.random() * 48));
          
          mockEvents.push({
            id: `payment-${i}`,
            title: `Payment for #${10000 + i}`,
            date: paymentDate.toISOString(),
            type: 'payment',
            amount: Math.floor(Math.random() * 500000) + 50000
          });
        }
        
        // Add a delivery event for completed orders
        if (randomStatus === 'completed' || randomStatus === 'delivered') {
          const deliveryDate = new Date(eventDate);
          deliveryDate.setHours(deliveryDate.getHours() + Math.floor(Math.random() * 72) + 24);
          
          mockEvents.push({
            id: `delivery-${i}`,
            title: `Delivery for #${10000 + i}`,
            date: deliveryDate.toISOString(),
            type: 'delivery'
          });
        }
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEvents(mockEvents);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load calendar events');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchEvents();
  }, [currentDate]); // Refetch when month changes
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get days for current month view
  const getDaysForMonthView = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start, end });
    
    // Get the day of the week the month starts (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeekStart = getDay(start);
    
    // Add days from previous month to align with first day of week (Sunday)
    const prevDays = [];
    for (let i = 0; i < dayOfWeekStart; i++) {
      prevDays.unshift(addDays(start, -i - 1));
    }
    
    // Get the day of the week the month ends
    const dayOfWeekEnd = getDay(end);
    
    // Add days from next month to complete the last week
    const nextDays = [];
    for (let i = 1; i < 7 - dayOfWeekEnd; i++) {
      nextDays.push(addDays(end, i));
    }
    
    // Combine all days
    return [...prevDays.reverse(), ...daysInMonth, ...nextDays];
  };
  
  // Get days for current week view
  const getDaysForWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 = Sunday
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };
  
  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      // Filter by event type if filter is active
      if (filter !== 'all' && event.type !== filter) {
        return false;
      }
      
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, day);
    });
  };
  
  // Format events for display
  const formatEventForDisplay = (event: Event) => {
    const eventDate = parseISO(event.date);
    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
    let icon = null;
    let extraClasses = "mb-1 text-xs justify-start truncate max-w-full";
    
    switch (event.type) {
      case 'order':
        icon = <ShoppingCart className="h-3 w-3 mr-1" />;
        
        if (event.status === 'completed' || event.status === 'delivered') {
          badgeVariant = "secondary";
        } else if (event.status === 'new') {
          badgeVariant = "default";
          extraClasses += " bg-primary/90 hover:bg-primary/80";
        }
        break;
      case 'payment':
        icon = <CreditCard className="h-3 w-3 mr-1" />;
        badgeVariant = "outline";
        extraClasses += " border-primary/30 bg-primary/5 hover:bg-primary/10 text-foreground";
        break;
      case 'delivery':
        icon = <Package className="h-3 w-3 mr-1" />;
        badgeVariant = "secondary";
        extraClasses += " bg-secondary/90 hover:bg-secondary/80";
        break;
    }
    
    return (
      <Badge 
        key={event.id}
        variant={badgeVariant}
        className={extraClasses}
      >
        {icon}
        <span className="truncate">
          {event.title}
        </span>
      </Badge>
    );
  };
  
  // Render day cell for month view
  const renderDayCell = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isToday = isSameDay(day, new Date());
    const isSunday = getDay(day) === 0;
    const isSaturday = getDay(day) === 6;
    
    return (
      <div 
        key={day.toString()}
        className={`border rounded-md p-1 h-24 overflow-hidden transition-colors ${
          !isCurrentMonth ? 'bg-muted/20 text-muted-foreground border-dashed' : ''
        } ${
          isToday ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 shadow-sm' : ''
        } ${
          (isSunday || isSaturday) && isCurrentMonth && !isToday ? 'bg-muted/10' : ''
        } ${
          isCurrentMonth ? 'cursor-pointer hover:border-primary/50 hover:bg-primary/5' : ''
        }`}
        onClick={() => isCurrentMonth && openDayDetails(day)}
      >
        <div className="flex justify-between items-center mb-1 pb-1 border-b border-border/40">
          <span 
            className={`text-xs font-medium ${
              isToday ? 'text-primary font-bold' : ''
            } ${
              isSunday ? 'text-rose-500 dark:text-rose-400' : ''
            } ${
              isSaturday ? 'text-rose-500 dark:text-rose-400' : ''
            }`}
          >
            {format(day, 'd')}
          </span>
          {dayEvents.length > 0 && (
            <span className="text-xs bg-primary/10 rounded-full px-1.5 py-0.5 text-primary font-medium">
              {dayEvents.length}
            </span>
          )}
        </div>
        
        <div className="flex flex-col gap-1 overflow-hidden">
          {dayEvents.slice(0, 3).map(event => formatEventForDisplay(event))}
          
          {dayEvents.length > 3 && (
            <span className="text-xs text-muted-foreground text-center mt-1">
              +{dayEvents.length - 3} more
            </span>
          )}
          
          {dayEvents.length === 0 && isCurrentMonth && (
            <div className="text-[10px] text-muted-foreground text-center pt-2 opacity-70">
              No events
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render the calendar month view
  const renderMonthView = () => {
    const days = getDaysForMonthView();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="h-full">
        <div className="grid grid-cols-7 gap-px mb-2 border-b pb-2">
          {weekdays.map((day, index) => (
            <div 
              key={day} 
              className={`text-center py-2 font-medium ${
                index === 0 || index === 6 ? 'text-rose-500 dark:text-rose-400' : 'text-foreground'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => renderDayCell(day))}
        </div>
      </div>
    );
  };
  
  // Render the calendar week view
  const renderWeekView = () => {
    const days = getDaysForWeekView();
    
    return (
      <div className="grid grid-cols-7 gap-1 h-full">
        {days.map((day, index) => (
          <div 
            key={day.toString()}
            className={`border border-border p-2 rounded-md ${
              isToday(day) ? 'bg-primary/5 dark:bg-primary/10 border-primary/30' : ''
            }`}
          >
            <div className="text-center mb-3 pb-2 border-b">
              <div className={`font-medium ${
                index === 0 || index === 6 ? 'text-rose-500 dark:text-rose-400' : ''
              } ${isToday(day) ? 'text-primary font-semibold' : ''}`}>
                {format(day, 'EEE', { locale: id })}
              </div>
              <div className={`text-xl ${isToday(day) ? 'text-primary font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
            
            <div className="space-y-1 mt-2 max-h-[300px] overflow-y-auto">
              {getEventsForDay(day).map(event => formatEventForDisplay(event))}
              {getEventsForDay(day).length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No events
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Function to open day details dialog
  const openDayDetails = (day: Date) => {
    setSelectedDay(day);
    setShowDayDetails(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">Calendar</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchEvents(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Calendar</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-8 w-[120px] text-xs mr-2">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="order">Orders</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="delivery">Deliveries</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
                className="h-8 text-xs font-medium"
              >
                Month
              </Button>
              <Button 
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
                className="h-8 text-xs font-medium"
              >
                Week
              </Button>
            </div>
          </div>
          <CardDescription>
            View and manage your business activities
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="text-lg font-medium">
                {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Week of' d MMMM yyyy", { locale: id })}
              </h3>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs font-medium"
            >
              Today
            </Button>
          </div>
          
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load calendar events: {error}
                </AlertDescription>
              </Alert>
            ) : view === 'month' ? (
              renderMonthView()
            ) : (
              renderWeekView()
            )}
          </div>
        </CardContent>
        
        <CardFooter className="py-4 border-t bg-muted/5">
          <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-1"></div>
              <span>New Orders</span>
            </div>
            
            <Separator orientation="vertical" className="h-4" />
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-secondary rounded-full mr-1"></div>
              <span>Completed</span>
            </div>
            
            <Separator orientation="vertical" className="h-4" />
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary/20 border border-primary/60 rounded-full mr-1"></div>
              <span>Payments</span>
            </div>
            
            <Separator orientation="vertical" className="h-4" />
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-rose-500/20 border border-rose-500/30 rounded-full mr-1"></div>
              <span>Weekend</span>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Day Details Dialog */}
      <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedDay && format(selectedDay, 'EEEE, d MMMM yyyy')}</span>
              {selectedDay && isToday(selectedDay) && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  Today
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedDay && getEventsForDay(selectedDay).length > 0 
                ? `${getEventsForDay(selectedDay).length} events on this day`
                : 'No events scheduled for this day'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {selectedDay && getEventsForDay(selectedDay).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDay(selectedDay).map(event => {
                  const eventDate = parseISO(event.date);
                  let eventTypeLabel = '';
                  let statusBadge = null;
                  
                  switch (event.type) {
                    case 'order':
                      eventTypeLabel = 'Order';
                      if (event.status) {
                        const statusColors: Record<string, string> = {
                          'new': 'text-primary bg-primary/10 border-primary/20',
                          'processing': 'text-yellow-600 bg-yellow-50 border-yellow-200',
                          'ready': 'text-green-600 bg-green-50 border-green-200',
                          'completed': 'text-secondary bg-secondary/10 border-secondary/20',
                          'delivered': 'text-secondary bg-secondary/10 border-secondary/20'
                        };
                        
                        statusBadge = (
                          <Badge variant="outline" className={`ml-2 ${statusColors[event.status] || ''}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </Badge>
                        );
                      }
                      break;
                    case 'payment':
                      eventTypeLabel = 'Payment';
                      break;
                    case 'delivery':
                      eventTypeLabel = 'Delivery';
                      break;
                    default:
                      eventTypeLabel = 'Event';
                  }
                  
                  return (
                    <div key={event.id} className="border rounded-md p-3 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {eventTypeLabel}
                          </Badge>
                          {statusBadge}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(eventDate, 'HH:mm')}
                        </div>
                      </div>
                      
                      <div className="text-sm font-medium mb-1">{event.title}</div>
                      
                      {event.amount && (
                        <div className="text-sm text-muted-foreground">
                          Amount: Rp {event.amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <div className="mb-2">
                  <CalendarIcon className="h-12 w-12 mx-auto opacity-20" />
                </div>
                <p>No events scheduled for this day</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 