"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus } from "lucide-react";

interface AddGradeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGrade: (grade: {
    subject: string;
    grade: number;
    date: string;
    description: string;
  }) => void;
  existingSubjects: string[];
  editingGrade?: {
    id: string;
    subject: string;
    grade: number;
    date: string;
    description?: string; // Made optional to match Grade interface
    created_at: string;
  } | null;
  isEditing?: boolean;
}

export function AddGradeDialog({
  open,
  onOpenChange,
  onAddGrade,
  existingSubjects,
  editingGrade = null,
  isEditing = false,
}: AddGradeProps) {
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [grade, setGrade] = useState<number>(1);
  const [gradeInput, setGradeInput] = useState<string>("1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  
  // Initialize form with editing grade data when available
  useEffect(() => {
    if (editingGrade) {
      if (existingSubjects.includes(editingGrade.subject)) {
        setSubject(editingGrade.subject);
        setShowCustomSubject(false);
      } else {
        setCustomSubject(editingGrade.subject);
        setShowCustomSubject(true);
      }
      setGrade(editingGrade.grade);
      setGradeInput(editingGrade.grade.toString());
      setDate(editingGrade.date);
      setDescription(editingGrade.description || ''); // Added fallback for undefined
    } else {
      // Reset form when not editing
      setSubject("");
      setCustomSubject("");
      setGrade(1);
      setGradeInput("1");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setShowCustomSubject(false);
    }
  }, [editingGrade, existingSubjects, open]);
  
  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGradeInput(value); // Always update the string value for the input
    
    // Only update the numeric value if it's valid
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setGrade(parsedValue);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate grade is between 1 and 6
    const validatedGrade = Math.min(Math.max(grade, 1), 6);
    
    onAddGrade({
      subject: showCustomSubject ? customSubject : subject,
      grade: validatedGrade,
      date,
      description,
    });
    
    // Reset form
    setSubject("");
    setCustomSubject("");
    setGrade(1);
    setGradeInput("1"); // Reset the input value too
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setShowCustomSubject(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Grade' : 'Add New Grade'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Edit the details of your grade. Click save when you\'re done.'
                : 'Enter the details for your new grade. Click save when you\'re done.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              {!showCustomSubject ? (
                <>
                  <Select 
                    value={subject} 
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setShowCustomSubject(true);
                      } else {
                        setSubject(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingSubjects.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <Plus size={16} />
                          <span>Add new subject</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="customSubject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter new subject"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setShowCustomSubject(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade">Grade (1-6)</Label>
              <Input
                id="grade"
                type="number"
                min="1"
                max="6"
                step="0.1"
                value={gradeInput} // Use the string value for the input
                onChange={handleGradeChange}
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Math test, Homework, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Save Grade'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
