"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AddEventDialog } from "@/components/add-event-dialog";
import { DayEventsDialog } from "@/components/day-events-dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMobileView, setIsMobileView] = useState(false);
  
  const supabase = createClient();

  const fetchEvents = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get the first and last day of the current month view
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Format dates for Supabase query
      const firstDayStr = firstDay.toISOString();
      const lastDayStr = new Date(
        lastDay.getFullYear(),
        lastDay.getMonth(),
        lastDay.getDate(),
        23, 59, 59
      ).toISOString();
      
      // Get events for the month
      const { data: eventsData, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .or(`start_date.lte.${lastDayStr},end_date.gte.${firstDayStr}`)
        .order('start_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(eventsData || []);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 640); // Same breakpoint as sm: in Tailwind
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Add listener for window resizing
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleAddEvent = async (newEvent: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    if (editingEvent) {
      // Update existing event
      const { error } = await supabase
        .from('calendar_events')
        .update({
          ...newEvent,
          user_id: user.id
        })
        .eq('id', editingEvent.id);
        
      if (error) {
        console.error('Error updating event:', error);
        return;
      }
    } else {
      // Insert new event
      const { error } = await supabase
        .from('calendar_events')
        .insert([{
          ...newEvent,
          user_id: user.id
        }]);
        
      if (error) {
        console.error('Error adding event:', error);
        return;
      }
    }
    
    // Reset editing state
    setEditingEvent(null);
    setSelectedDate(null);
    
    // Refresh the events list
    fetchEvents();
    setDialogOpen(false);
  };
  
  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
    // Close the day dialog if it's open
    setDayDialogOpen(false);
  };
  
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    
    setIsLoading(true); // Show loading state while deleting
    
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventToDelete);
    
    if (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } else {
      // Refresh events after deletion
      await fetchEvents();
      console.log('Event successfully deleted!');
    }
    
    setDeleteDialogOpen(false);
    setEventToDelete(null);
    setIsLoading(false);
  };
  
  const handleEditClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(new Date(date));
    setDayDialogOpen(true);
  };
  
  const handleAddEventForDate = () => {
    setEditingEvent(null); // Make sure editing state is null
    setDialogOpen(true);
  };

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
    // ...existing code...
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

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          Calendar
        </div>
      </header>
      
      <div className="flex flex-col gap-4 px-6 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-2xl font-bold">Your Calendar</h2>
          <div className="flex flex-wrap items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center rounded-md border bg-background">
              <Button variant="ghost" size="sm" onClick={prevMonth} className="p-1.5 sm:p-2">
                <ChevronLeft size={18} />
              </Button>
              <div className="px-2 py-1 font-medium min-w-[120px] sm:min-w-[160px] text-center truncate">
                {formatMonthYear(currentMonth)}
              </div>
              <Button variant="ghost" size="sm" onClick={nextMonth} className="p-1.5 sm:p-2">
                <ChevronRight size={18} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
              <Button size="sm" onClick={() => {
                setEditingEvent(null); // Reset editing state first
                setDialogOpen(true);
              }} className="flex gap-2">
                <Plus size={16} />
                <span className="hidden sm:inline">Add Event</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Layout container for calendar and events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar section - takes 2/3 of space on large screens */}
          <div className={`${isLoading ? "" : "rounded-lg border shadow-sm overflow-hidden"} lg:col-span-2`}>
            {isLoading ? (
              <div className="grid grid-cols-7 gap-2 h-[500px]">
                {Array.from({ length: 42 }).map((_, i) => (
                  <Skeleton key={i} className="h-full w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Calendar grid view - responsive for both mobile and desktop */}
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
                            "min-h-[60px] sm:min-h-[90px] border-r border-b p-0.5 sm:p-1 last:border-r-0 relative group",
                            !dayInfo.isCurrentMonth && "bg-muted/30 text-muted-foreground",
                            dayInfo.isToday && "bg-primary/5"
                          )}
                          onClick={() => handleDayClick(dayInfo.date)}
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
                            {dayInfo.isCurrentMonth && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-4 w-4 sm:h-6 sm:w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDate(dayInfo.date);
                                  setEditingEvent(null); // Reset editing state first
                                  handleAddEventForDate();
                                }}
                              >
                                <Plus size={12} className="sm:hidden" />
                                <Plus size={14} className="hidden sm:block" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-1 mt-0.5 sm:mt-1 max-h-[40px] sm:max-h-[60px] overflow-y-auto">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div 
                                key={event.id}
                                className={cn(
                                  "text-[10px] sm:text-xs p-0.5 sm:p-1 rounded-sm truncate cursor-pointer",
                                  colorMap[event.color] || "bg-gray-100 dark:bg-gray-800"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation(); // Stop event bubbling
                                  
                                  // On mobile, always open day view instead of edit dialog
                                  if (isMobileView) {
                                    handleDayClick(dayInfo.date);
                                  } else {
                                    // On desktop, keep existing behavior (edit event)
                                    handleEditClick(event);
                                  }
                                }}
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
              </>
            )}
          </div>
          
          {/* Upcoming events section - takes 1/3 of space on large screens */}
          <div className="rounded-lg border shadow-sm p-3 sm:p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CalendarIcon size={18} className="text-muted-foreground" />
              Upcoming Events
            </h3>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[300px] sm:max-h-[400px] lg:max-h-[600px] overflow-y-auto pr-1">
                {events
                  .filter(event => new Date(event.start_date) >= new Date())
                  .map(event => {
                    const start = new Date(event.start_date);
                    
                    return (
                      <div 
                        key={event.id} 
                        className="border p-2 sm:p-3 rounded-md bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handleEditClick(event)}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm sm:text-base">{event.title}</h4>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(event);
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <Pencil size={14} />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(event.id);
                              }}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={14} />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
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
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setEditingEvent(null); // Reset editing state first
                        setDialogOpen(true);
                      }}
                      className="mt-2"
                    >
                      Add your first event
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add/Edit Event Dialog */}
      <AddEventDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onAddEvent={handleAddEvent}
        onDeleteEvent={handleDeleteClick} // Add this prop to pass the delete function
        eventDate={selectedDate}
        editingEvent={editingEvent}
        isEditing={!!editingEvent}
      />
      
      {/* Day Events Dialog */}
      <DayEventsDialog
        open={dayDialogOpen}
        onOpenChange={setDayDialogOpen}
        date={selectedDate}
        events={selectedDate ? getEventsForDay(selectedDate) : []}
        onAddEvent={handleAddEventForDate}
        onEditEvent={handleEditClick}
        onDeleteEvent={handleDeleteClick}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}