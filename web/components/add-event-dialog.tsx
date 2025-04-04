"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddEventProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    color: string;
  }) => void;
  onDeleteEvent?: (eventId: string) => void; // New prop for delete functionality
  eventDate?: Date;
  editingEvent?: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    color: string;
    created_at: string;
  } | null;
  isEditing?: boolean;
}

// Color mapping for different event colors with visual representation
const colorOptions = [
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500" },
];

export function AddEventDialog({
  open,
  onOpenChange,
  onAddEvent,
  onDeleteEvent,
  eventDate,
  editingEvent = null,
  isEditing = false,
}: AddEventProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState("blue");

  // Initialize form with editing event data when available
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description);
      
      // Fix date parsing to avoid timezone issues
      const eventStartDate = new Date(editingEvent.start_date);
      
      // Format date in YYYY-MM-DD format using local timezone
      const year = eventStartDate.getFullYear();
      const month = String(eventStartDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventStartDate.getDate()).padStart(2, '0');
      
      setDate(`${year}-${month}-${day}`);
      
      setColor(editingEvent.color || "blue");
    } else {
      // Reset form when not editing
      setTitle("");
      setDescription("");
      
      if (eventDate) {
        // Format with local timezone to avoid date shifts
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        
        setDate(`${year}-${month}-${day}`);
      } else {
        // Set today's date in local timezone
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const day = String(today.getDate()).padStart(2, '0');
        
        setDate(`${year}-${month}-${day}`);
      }
      
      setColor("blue");
    }
  }, [editingEvent, eventDate, open]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create start and end dates for the selected day (all-day event)
    // Use the date without time part to avoid timezone issues
    const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    
    // Create dates in local timezone
    const start = new Date(year, month - 1, day, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59);
    
    onAddEvent({
      title,
      description,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      color,
    });
  };

  // Handler for delete button click
  const handleDelete = () => {
    if (editingEvent && onDeleteEvent) {
      onDeleteEvent(editingEvent.id);
      onOpenChange(false); // Close dialog after deletion
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Edit the details of your event.'
                : 'Enter the details for your new event.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="color">Event Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger id="color">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((colorOption) => (
                    <SelectItem key={colorOption.value} value={colorOption.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded-full", colorOption.class)}></div>
                        <span>{colorOption.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            {/* Add delete button when in edit mode */}
            {isEditing && onDeleteEvent && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="submit" className={isEditing ? "" : "w-full"}>
              {isEditing ? 'Save Changes' : 'Save Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
