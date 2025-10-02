/**
 * Edit School Dialog Component
 * Form for editing existing schools
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
import { useSchools } from '@/hooks/use-schools';
import type { School, UpdateSchoolData } from '@/types/school';

interface EditSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  onComplete?: () => void;
}

const defaultColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export function EditSchoolDialog({ open, onOpenChange, school, onComplete }: EditSchoolDialogProps) {
  const { updateSchool } = useSchools();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateSchoolData>({
    name: '',
    color: defaultColors[0],
    is_archived: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when school changes
  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        color: school.color,
        is_archived: school.is_archived
      });
    }
  }, [school]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name && !formData.name.trim()) {
      newErrors.name = 'School name cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!school || !validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await updateSchool(school.id, formData);
      
      if (success) {
        setErrors({});
        onOpenChange(false);
        onComplete?.();
      }
    } catch (error) {
      console.error('Error updating school:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateSchoolData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit School</DialogTitle>
          <DialogDescription>
            Update the details of your school.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">School Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Harvard University, Lincoln High School"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-color">Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="edit-color"
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <div className="flex gap-2 flex-wrap">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: color,
                      borderColor: formData.color === color ? '#000' : 'transparent'
                    }}
                    onClick={() => handleInputChange('color', color)}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose a color to easily identify this school
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
