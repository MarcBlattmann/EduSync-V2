"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, ChevronLeft, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { useParams } from "next/navigation";

interface CalendarShare {
  id: string;
  user_id: string;
  share_code: string;
  name: string;
  expires_at: string | null;
  created_at: string;
  active: boolean;
  owner_name: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
  created_at: string;
}

// Color mapping for different event colors
const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export default function SharedCalendarPage() {
  const params = useParams();
  const shareCode = params.code as string;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shareData, setShareData] = useState<CalendarShare | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedCalendar = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/calendar-share/${shareCode}`);
        const data = await response.json();
        
        if (!response.ok) {
          // Set error message without throwing an exception
          if (response.status === 404) {
            setError("This shared calendar is no longer available. It may have been deleted by its owner.");
          } else if (response.status === 403) {
            setError("This shared calendar link has expired.");
          } else {
            setError(data.error || "Failed to load shared calendar");
          }
          return;
        }
        
        setEvents(data.events || []);
        setShareData(data.share || null);
      } catch (err: any) {
        // Only log technical errors, not our user-friendly ones
        if (err.message !== "Failed to fetch") {
          console.error("Error loading shared calendar:", err);
        }
        setError("Unable to connect to the server. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (shareCode) {
      fetchSharedCalendar();
    }
  }, [shareCode]);

  // Calendar navigation functions
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get days in month array (including padding days from prev/next month)
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and last day
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Array to hold all days we'll display
    const daysArray = [];
    
    // Add days from previous month to fill first row
    const daysFromPrevMonth = firstDayWeekday;
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      daysArray.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Add all days from current month
    const daysInMonth = lastDayOfMonth.getDate();
    const today = new Date();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      
      daysArray.push({
        date,
        isCurrentMonth: true,
        isToday
      });
    }
    
    // Add days from next month to complete grid (ensure we have 6 rows total)
    const totalDaysNeeded = 42; // 6 rows × 7 days
    const daysFromNextMonth = totalDaysNeeded - daysArray.length;
    
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      daysArray.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return daysArray;
  };

  // Filter events for a specific day
  const getEventsForDay = (date: Date) => {
    if (!events || events.length === 0) return [];
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      
      // Event starts before day ends AND event ends after day starts
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  // Format month and year for header
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="container py-6 max-w-screen-xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/calendar">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to My Calendar
            </Link>
          </Button>
        </div>
        <div className="animate-pulse">
          <Skeleton className="h-10 w-60 mb-4" />
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state display
  if (error) {
    return (
      <div className="container py-6 max-w-screen-xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/calendar">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to My Calendar
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-primary">Calendar Unavailable</h1>
            <p className="text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-screen-xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/protected/calendar">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to My Calendar
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-2xl font-bold">
            {shareData?.owner_name || 'Shared Calendar'}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {shareData?.name && `(${shareData.name})`}
            </span>
          </h2>
          
          <div className="flex flex-wrap items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center rounded-md border bg-background">
              <Button variant="ghost" size="sm" onClick={prevMonth} className="p-1.5 sm:p-2">
                <ChevronLeft size={18} />
              </Button>
              <div className="px-2 py-1 font-medium min-w-[120px] sm:min-w-[160px] text-center truncate">
                {formatMonthYear(currentMonth)}
              </div>
              <Button variant="ghost" size="sm" onClick={nextMonth} className="p-1.5 sm:p-2">
                <ChevronLeft size={18} className="rotate-180" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
          </div>
        </div>
        
        {/* Calendar section */}
        <div className="rounded-lg border shadow-sm overflow-hidden">
          {/* Calendar grid view */}
          <div className="overflow-x-auto">
            {/* Calendar header */}
            <div className="grid grid-cols-7 bg-muted/70">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="p-1 sm:p-2 text-center font-medium border-r border-b last:border-r-0 text-xs sm:text-sm">
                  <span className="sm:hidden">{day}</span>
                  <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 bg-card min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
              {getDaysInMonth().map((dayInfo, index) => {
                const dayEvents = getEventsForDay(dayInfo.date);
                return (
                  <div 
                    key={index}
                    className={cn(
                      "min-h-[60px] sm:min-h-[90px] border-r border-b p-0.5 sm:p-1 last:border-r-0 relative",
                      !dayInfo.isCurrentMonth && "bg-muted/30 text-muted-foreground",
                      dayInfo.isToday && "bg-primary/5"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div 
                        className={cn(
                          "h-5 w-5 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium",
                          dayInfo.isToday && "bg-primary text-primary-foreground"
                        )}
                      >
                        {dayInfo.date.getDate()}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mt-0.5 sm:mt-1 max-h-[40px] sm:max-h-[60px] overflow-y-auto">
                      {dayEvents.map((event) => (
                        <div 
                          key={event.id}
                          className={cn(
                            "text-[10px] sm:text-xs p-0.5 sm:p-1 rounded-sm truncate",
                            colorMap[event.color] || "bg-gray-100 dark:bg-gray-800"
                          )}
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground pl-0.5 sm:pl-1">
                          + {dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* List upcoming events */}
        <div className="rounded-lg border shadow-sm p-3 sm:p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CalendarIcon size={18} className="text-muted-foreground" />
            Upcoming Events
          </h3>
          
          <div className="flex flex-col gap-2 max-h-[300px] sm:max-h-[400px] lg:max-h-[600px] overflow-y-auto pr-1">
            {events
              .filter(event => new Date(event.start_date) >= new Date())
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .map(event => {
                const start = new Date(event.start_date);
                
                return (
                  <div 
                    key={event.id} 
                    className="border p-2 sm:p-3 rounded-md bg-card"
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm sm:text-base">{event.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        `bg-${event.color}-500`
                      )} />
                      <div className="text-xs text-muted-foreground">
                        {start.toLocaleDateString()}
                      </div>
                    </div>
                    {event.description && (
                      <div className="text-xs sm:text-sm mt-2 line-clamp-2">{event.description}</div>
                    )}
                  </div>
                );
              })}
              
            {events.filter(event => new Date(event.start_date) >= new Date()).length === 0 && (
              <div className="text-muted-foreground text-center p-4 border rounded-md bg-card/50">
                <p className="text-sm">No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}