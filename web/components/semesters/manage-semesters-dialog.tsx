/**
 * Manage Semesters Dialog Component
 * Interface for editing, deleting, and managing existing semesters
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Edit, 
  Trash2, 
  Star, 
  Calendar,
  MoreHorizontal,
  Search,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSemesters } from '@/hooks/use-semesters';
import { EditSemesterDialog } from './edit-semester-dialog';
import { CreateSemesterDialog } from './create-semester-dialog';
import type { Semester } from '@/types/semester';

interface ManageSemestersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageSemestersDialog({ open, onOpenChange }: ManageSemestersDialogProps) {
  const { semesters, deleteSemester, isLoading } = useSemesters();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
    return `${start} - ${end}`;
  };
  const filteredSemesters = semesters.filter(semester =>
    semester.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester);
    setEditDialogOpen(true);
  };
  const handleDelete = (semester: Semester) => {
    setDeletingSemester(semester);
    setDeleteDialogOpen(true);
  };

  // Helper function to check if a semester is currently active based on date
  const isCurrentlyActive = (semester: Semester) => {
    const today = new Date();
    const startDate = new Date(semester.start_date);
    const endDate = new Date(semester.end_date);
    return today >= startDate && today <= endDate;
  };

  const confirmDelete = async () => {
    if (deletingSemester) {
      await deleteSemester(deletingSemester.id);
      setDeleteDialogOpen(false);
      setDeletingSemester(null);
    }
  };

  const handleEditComplete = () => {
    setEditDialogOpen(false);
    setEditingSemester(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Manage Semesters</DialogTitle>
            <DialogDescription>
              Edit, delete, or set active status for your semesters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and New Semester Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search semesters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="sm:ml-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Semester
              </Button>
            </div>

            {/* Semesters Table */}
            <div className="border rounded-lg overflow-y-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        Loading semesters...
                      </TableCell>
                    </TableRow>
                  ) : filteredSemesters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        {searchQuery ? 'No semesters match your search.' : 'No semesters found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSemesters.map((semester) => (
                      <TableRow key={semester.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {semester.name}
                            {isCurrentlyActive(semester) && (
                              <Star className="h-4 w-4 fill-current text-primary" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateRange(semester.start_date, semester.end_date)}
                        </TableCell>                        <TableCell>
                          {isCurrentlyActive(semester) ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(semester)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(semester)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            {semesters.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredSemesters.length} of {semesters.length} semesters
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>      {/* Create Dialog */}
      <CreateSemesterDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit Dialog */}
      <EditSemesterDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        semester={editingSemester}
        onComplete={handleEditComplete}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Semester</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSemester?.name}"? 
              This action cannot be undone. Grades associated with this semester 
              will not be deleted but will no longer be linked to any semester.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Semester
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
