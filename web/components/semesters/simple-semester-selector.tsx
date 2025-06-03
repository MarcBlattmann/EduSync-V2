/**
 * Simple Semester Selector Component
 * A clean dropdown selector for filtering by semester
 */

'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSemesters } from '@/hooks/use-semesters';

interface SimpleSemesterSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  showAllOption?: boolean;
}

export function SimpleSemesterSelector({ 
  value, 
  onValueChange, 
  showAllOption = true 
}: SimpleSemesterSelectorProps) {
  const { semesters, isLoading } = useSemesters();

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
    return `${start} - ${end}`;
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select semester" />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">All Semesters</SelectItem>
        )}
        {semesters.map((semester) => (
          <SelectItem key={semester.id} value={semester.id}>
            <div className="flex flex-col">
              <span className="font-medium">{semester.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDateRange(semester.start_date, semester.end_date)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
