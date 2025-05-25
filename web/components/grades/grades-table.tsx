"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SortAsc, SortDesc, X, Pencil, Trash2 } from "lucide-react";
import { useGradeSystem, formatGrade, getGradeColor } from "@/hooks/use-grade-system";

// Grade interface
interface Grade {
  id: string;
  user_id: string;
  subject: string;
  grade: number;
  date: string;
  description?: string;
  created_at: string;
}

// Props for the GradesTable component
interface GradesTableProps {
  grades: Grade[];
  subjects: string[];
  onEdit?: (grade: Grade) => void;
  onDelete?: (gradeId: string) => void;
}

export function GradesTable({ grades, subjects, onEdit, onDelete }: GradesTableProps) {
  // State for filters and sorting
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Grade | null;
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc",
  });
  // Use the grade system hook instead of manual state management
  const { gradeSystem: gradeSystemState } = useGradeSystem();
  const { displayLabel } = useDisplayPreferences();
  
  // Helper functions to apply formatting and colors based on the grade system
  const getGradeColorHelper = (grade: number): string => {
    return getGradeColor(grade, gradeSystemState);
  };
  
  const formatGradeHelper = (grade: number): string => {
    // Individual grades should always show in their original format, not converted to GPA
    return formatGrade(grade, gradeSystemState);
  };

  // Handle sorting
  const handleSort = (key: keyof Grade) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Apply filters and sorting to the grades
  const filteredGrades = grades
    .filter((grade) => {
      // Apply subject filter if selected
      if (selectedSubject && selectedSubject !== "all" && grade.subject !== selectedSubject) {
        return false;
      }
      
      // Apply search filter to subject and description
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSubject = grade.subject.toLowerCase().includes(query);
        const matchesDescription = grade.description
          ? grade.description.toLowerCase().includes(query)
          : false;
        
        return matchesSubject || matchesDescription;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (!sortConfig.key) return 0;
      
      // Get values safely, handling potential undefined values
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle undefined values in the comparison
      if (aValue === undefined && bValue === undefined) {
        return 0;
      }
      if (aValue === undefined) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (bValue === undefined) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      
      // Safe comparison now that we've handled undefined cases
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Render sort icon
  const renderSortIcon = (key: keyof Grade) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "asc" ? (
      <SortAsc className="h-4 w-4 ml-1" />
    ) : (
      <SortDesc className="h-4 w-4 ml-1" />
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSubject("all");
    setSearchQuery("");
    setSortConfig({
      key: "date",
      direction: "desc",
    });
  };

  return (
    <div className="space-y-4 w-full">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search subjects or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[250px] pl-8"
            />
          </div>
        </div>

        {/* Active filters */}
        <div className="flex items-center gap-2">
          {(selectedSubject !== "all" || searchQuery) && (
            <>
              <div className="flex flex-wrap gap-1">
                {selectedSubject !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Subject: {selectedSubject}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedSubject("all")}
                    />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchQuery}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                Clear all
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grades table */}
      <div className="rounded-md border">
        <Table className="[&_td]:py-2 [&_td]:px-4">
          <TableHeader>
            <TableRow className="h-10">
              <TableHead
                className="cursor-pointer py-2"
                onClick={() => handleSort("subject")}
              >
                <div className="flex items-center">
                  Subject {renderSortIcon("subject")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer w-[100px] text-center py-2"
                onClick={() => handleSort("grade")}
              >
                <div className="flex items-center justify-center">
                  Grade {renderSortIcon("grade")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer w-[120px] py-2"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date {renderSortIcon("date")}
                </div>
              </TableHead>
              <TableHead className="py-2">Description</TableHead>
              {(onEdit || onDelete) && (
                <TableHead className="w-[100px] text-right py-2">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onEdit || onDelete ? 5 : 4} className="h-24 text-center">
                  No grades found matching the filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredGrades.map((grade) => (                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.subject}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold ${getGradeColorHelper(grade.grade)}`}>
                      {formatGradeHelper(grade.grade)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(grade.date)}</TableCell>
                  <TableCell>{grade.description || "—"}</TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(grade)}
                            title="Edit grade"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(grade.id)}
                            title="Delete grade"
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Table footer with count */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          Showing {filteredGrades.length} of {grades.length} grades
        </div>
      </div>
    </div>
  );
}