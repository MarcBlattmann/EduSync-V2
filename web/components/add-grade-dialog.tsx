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
import { useGradeSystem, getGradeRange } from "@/hooks/use-grade-system";

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
  const [showCustomSubject, setShowCustomSubject] = useState(false);  // Use our centralized grade system hook
  const { gradeSystem: gradeSystemState } = useGradeSystem();  // Use our imported getGradeRange utility
  const gradeRangeInfo = getGradeRange(gradeSystemState);
  const { min, max, step } = gradeRangeInfo;
  
  // Create a more descriptive label based on the grade system
  let label = 'Grade';
  switch (gradeSystemState) {
    case '1best':
      label = 'Grade (1-6, 1 is best)';
      break;
    case '6best':
      label = 'Grade (1-6, 6 is best)';
      break;
    case 'american':
      label = 'Grade (A-F, A=4.0, F=0)';
      break;
    case 'gpa':
      label = 'GPA (0.0-4.0)';
      break;
    case 'percentage':
      label = 'Percentage (0-100%)';
      break;
  }

  // Initialize form with editing grade data when available  // Handle form initialization based on editing state and grade system
  useEffect(() => {
    if (editingGrade) {
      // When editing an existing grade
      if (existingSubjects.includes(editingGrade.subject)) {
        setSubject(editingGrade.subject);
        setShowCustomSubject(false);
      } else {
        setCustomSubject(editingGrade.subject);
        setShowCustomSubject(true);
      }
      
      // Set the grade value from the existing grade - ensure proper decimal display
      const roundedGrade = Math.round(editingGrade.grade * 100) / 100;
      setGrade(roundedGrade);
      setGradeInput(roundedGrade.toString());
      setDate(editingGrade.date);
      setDescription(editingGrade.description || ''); // Added fallback for undefined
    } else {
      // Reset form when not editing - use appropriate defaults for the current grade system
      setSubject("");
      setCustomSubject("");
      
      // Default to the middle of the grading scale based on the system
      let defaultGrade = min;
      if (gradeSystemState === 'percentage') {
        defaultGrade = 75; // Default to C for percentage
      } else if (gradeSystemState === 'american' || gradeSystemState === 'gpa') {
        defaultGrade = 3.0; // Default to B for American/GPA
      } else {
        // For numeric systems (1-6), use appropriate default
        defaultGrade = gradeSystemState === '1best' ? 2 : 5; // Good grade in respective system
      }
      
      setGrade(defaultGrade);
      setGradeInput(defaultGrade.toString());
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setShowCustomSubject(false);
    }
  }, [editingGrade, existingSubjects, open, min, max, gradeSystemState]);  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGradeInput(value); // Always update the string value for the input

    // Only update the numeric value if it's valid
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      // Clamp value to the min-max range for the current grade system
      const clampedValue = Math.min(Math.max(parsedValue, min), max);
      
      // Round to 2 decimal places for precision but no floating point errors
      const roundedValue = Math.round(clampedValue * 100) / 100;
      setGrade(roundedValue);
      
      // Log for debugging
      if (clampedValue !== parsedValue) {
        console.log(`Adjusted grade value from ${parsedValue} to ${roundedValue}`);
      }
    } else {
      console.warn("Invalid grade input:", value);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check for required fields
      const selectedSubject = showCustomSubject ? customSubject : subject;
      if (!selectedSubject) {
        alert("Please select or enter a subject");
        return;
      }
      
      // Validate grade is between min and max
      let validatedGrade = grade;
      if (isNaN(validatedGrade)) {
        alert("Please enter a valid grade value");
        return;
      }
      
      // Ensure the grade is within the valid range for the current system
      validatedGrade = Math.min(Math.max(validatedGrade, min), max);
      
      // Log what's being submitted for debugging
      console.log("Submitting grade:", {
        subject: selectedSubject,
        grade: validatedGrade,
        date,
        description,
        gradeSystem: gradeSystemState
      });
      
      onAddGrade({
        subject: selectedSubject,
        grade: validatedGrade,
        date,
        description,
      });
  
      // Reset form
      setSubject("");
      setCustomSubject("");
      setGrade(min); // Reset to min value for the current system
      setGradeInput(min.toString()); // Reset the input value too
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setShowCustomSubject(false);
    } catch (error) {
      console.error("Error in form submission:", error);
      alert("There was an error submitting the grade. Please try again.");
    }
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
            <div className="grid gap-2">              <Label htmlFor="grade">{label}</Label>
              <Input
                id="grade"
                type="number"
                min={min}
                max={max}
                step={step.toString()} 
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
