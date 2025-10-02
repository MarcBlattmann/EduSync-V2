/**
 * Manage Schools Dialog Component
 * Interface for editing, deleting, archiving and managing existing schools
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  MoreHorizontal,
  Search,
  Plus,
  GraduationCap,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSchools } from '@/hooks/use-schools';
import { EditSchoolDialog } from './edit-school-dialog';
import { CreateSchoolDialog } from './create-school-dialog';
import type { School } from '@/types/school';

interface ManageSchoolsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSubjects?: string[]; // Add existing subjects prop
}

export function ManageSchoolsDialog({ open, onOpenChange, existingSubjects = [] }: ManageSchoolsDialogProps) {
  const { schools, deleteSchool, refreshSchools, isLoading } = useSchools();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setEditDialogOpen(true);
  };

  const handleDelete = (school: School) => {
    setDeletingSchool(school);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingSchool) {
      await deleteSchool(deletingSchool.id);
      setDeleteDialogOpen(false);
      setDeletingSchool(null);
    }
  };

  const handleEditComplete = () => {
    setEditDialogOpen(false);
    setEditingSchool(null);
  };

  const handleCreateComplete = () => {
    refreshSchools();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Manage Schools</DialogTitle>
            <DialogDescription>
              Add, edit, or delete your schools to organize grades by institution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Info Box - Only show when no schools exist */}
            {schools.length === 0 && (
              <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm space-y-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    About Schools Feature
                  </p>
                  <p className="text-blue-800 dark:text-blue-200">
                    Schools help organize grades when attending multiple institutions. If you only attend one school, 
                    this feature is unnecessary. You can disable it anytime in <span className="font-medium">Settings → System → Beta Features</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Search and New School Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search schools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New School
                </Button>
              </div>
            </div>

            {/* Schools Table */}
            <div className="border rounded-lg overflow-y-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6">
                        Loading schools...
                      </TableCell>
                    </TableRow>
                  ) : filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6">
                        {searchQuery 
                          ? 'No schools match your search.' 
                          : 'No schools found. Create your first school to get started!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" style={{ color: school.color }} />
                            {school.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border" 
                              style={{ backgroundColor: school.color }}
                            />
                            <span className="text-sm text-muted-foreground">{school.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(school)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(school)}
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
            {schools.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredSchools.length} of {schools.length} schools
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <CreateSchoolDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onComplete={handleCreateComplete}
        existingSubjects={existingSubjects}
      />

      {/* Edit Dialog */}
      <EditSchoolDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        school={editingSchool}
        onComplete={handleEditComplete}
        existingSubjects={existingSubjects}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSchool?.name}"? 
              This action cannot be undone. Grades associated with this school 
              will not be deleted but will no longer be linked to any school.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete School
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
