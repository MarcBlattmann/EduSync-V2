/**
 * Semester Selection Component
 * Allows users to view and switch between semesters
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, Plus, Settings, Star } from 'lucide-react';
import { useSemesters } from '@/hooks/use-semesters';
import { CreateSemesterDialog } from './create-semester-dialog';
import { ManageSemestersDialog } from './manage-semesters-dialog';
import type { Semester } from '@/types/semester';

interface SemesterSelectorProps {
  onSemesterChange?: (semester: Semester | null) => void;
  showAllOption?: boolean;
  compact?: boolean;
}

export function SemesterSelector({ 
  onSemesterChange, 
  showAllOption = true, 
  compact = false 
}: SemesterSelectorProps) {
  const { semesters, activeSemester, isLoading } = useSemesters();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);

  // Initialize selected semester to active semester when it changes
  useEffect(() => {
    if (activeSemester && !selectedSemesterId) {
      setSelectedSemesterId(activeSemester.id);
    }
  }, [activeSemester, selectedSemesterId]);

  const handleSemesterChange = (semesterId: string) => {
    if (semesterId === 'all') {
      setSelectedSemesterId(null);
      onSemesterChange?.(null);
      return;
    }

    const semester = semesters.find(s => s.id === semesterId);
    if (semester) {
      setSelectedSemesterId(semester.id);
      onSemesterChange?.(semester);
    }
  };

  // Helper function to check if a semester is currently active based on date
  const isCurrentlyActive = (semester: Semester) => {
    const today = new Date();
    const startDate = new Date(semester.start_date);
    const endDate = new Date(semester.end_date);
    return today >= startDate && today <= endDate;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    return `${start} - ${end}`;
  };
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={selectedSemesterId || 'all'}
          onValueChange={handleSemesterChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <Calendar className="h-4 w-4" />
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            {showAllOption && (
              <SelectItem value="all">All Semesters</SelectItem>
            )}
            {semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                <div className="flex items-center gap-2">
                  {semester.name}
                  {isCurrentlyActive(semester) && <Star className="h-3 w-3 fill-current" />}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Semester</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Semester
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setManageDialogOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading semesters...</div>
      ) : semesters.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-2">No semesters yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first semester to start organizing your grades
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Semester
          </Button>
        </div>
      ) : (
        <div className="space-y-2">          {showAllOption && (
            <div
              className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                !selectedSemesterId ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => handleSemesterChange('all')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">All Semesters</div>
                  <div className="text-sm text-muted-foreground">
                    View grades from all time periods
                  </div>
                </div>
                {!selectedSemesterId && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
            </div>
          )}
            {semesters.map((semester) => (
            <div
              key={semester.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedSemesterId === semester.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => handleSemesterChange(semester.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{semester.name}</span>
                    {isCurrentlyActive(semester) && (
                      <Star className="h-4 w-4 fill-current text-primary" />
                    )}
                  </div>                  <div className="text-sm text-muted-foreground">
                    {formatDateRange(semester.start_date, semester.end_date)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrentlyActive(semester) && (
                    <Badge variant="default">Active</Badge>
                  )}
                  {selectedSemesterId === semester.id && (
                    <Badge variant="outline">Selected</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateSemesterDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      
      <ManageSemestersDialog
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
      />
    </div>
  );
}
