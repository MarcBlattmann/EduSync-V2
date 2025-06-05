/**
 * Edit Semester Dialog Component
 * Form for editing existing semesters
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useSemesters } from '@/contexts/semester-context';
import type { Semester, UpdateSemesterData } from '@/types/semester';

interface EditSemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester: Semester | null;
  onComplete: () => void;
}

export function EditSemesterDialog({ 
  open, 
  onOpenChange, 
  semester, 
  onComplete 
}: EditSemesterDialogProps) {
  const { updateSemester } = useSemesters();
  const [isLoading, setIsLoading] = useState(false);  const [formData, setFormData] = useState<UpdateSemesterData>({
    name: '',
    start_date: '',
    end_date: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});  // Reset form when semester changes
  useEffect(() => {
    if (semester) {
      setFormData({
        name: semester.name,
        start_date: semester.start_date,
        end_date: semester.end_date
      });
      setErrors({});
    }
  }, [semester]);
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Semester name is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!semester || !validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await updateSemester(semester.id, formData);
      
      if (success) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating semester:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (field: keyof UpdateSemesterData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    onComplete();
  };

  if (!semester) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Semester</DialogTitle>
          <DialogDescription>
            Update the details for "{semester.name}".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Semester Name</Label>
            <Input
              id="name"
              placeholder="e.g., Fall 2024, Spring 2025"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={errors.start_date ? 'border-destructive' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.end_date}
                min={formData.start_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={errors.end_date ? 'border-destructive' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-destructive">{errors.end_date}</p>
              )}
            </div>          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
