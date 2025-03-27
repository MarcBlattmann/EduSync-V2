"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AddGradeDialog } from "@/components/add-grade-dialog";
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Grade {
  id: string;
  subject: string;
  grade: number;
  date: string;
  description: string;
  created_at: string;
}

export default function Grades() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [subjects, setSubjects] = useState<string[]>([]);
    const supabase = createClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [gradeToDelete, setGradeToDelete] = useState<string | null>(null);

    const fetchGrades = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            const { data: gradesData, error } = await supabase
                .from('grades')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
            
            if (error) {
                console.error('Error fetching grades:', error);
            } else {
                setGrades(gradesData || []);
                
                // Extract unique subjects for the dropdown
                const uniqueSubjects = [...new Set(gradesData?.map(g => g.subject) || [])];
                setSubjects(uniqueSubjects);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchGrades();
    }, [supabase]);

    const handleAddGrade = async (newGrade: Omit<Grade, 'id' | 'created_at'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { data, error } = await supabase
            .from('grades')
            .insert([{
                ...newGrade,
                user_id: user.id
            }])
            .select();
            
        if (error) {
            console.error('Error adding grade:', error);
            return;
        }
        
        // Refresh the grades list
        fetchGrades();
        setDialogOpen(false);
    };
    
    const handleDeleteClick = (gradeId: string) => {
        setGradeToDelete(gradeId);
        setDeleteDialogOpen(true);
    };
    
    const handleDeleteConfirm = async () => {
        if (!gradeToDelete) return;
        
        const { error } = await supabase
            .from('grades')
            .delete()
            .eq('id', gradeToDelete);
        
        if (error) {
            console.error('Error deleting grade:', error);
        } else {
            // Refresh grades after deletion
            fetchGrades();
        }
        
        setDeleteDialogOpen(false);
        setGradeToDelete(null);
    };
    
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    Grades
                </div>
            </header>
            
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Your Grades</h2>
                    <Button onClick={() => setDialogOpen(true)} className="flex gap-2">
                        <Plus size={16} />
                        Add Grade
                    </Button>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <p>Loading grades...</p>
                    </div>
                ) : grades.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <p>No grades found</p>
                        <p className="text-sm">Add your first grade to get started</p>
                    </div>
                ) : (
                    <div className="border rounded-md">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Subject</th>
                                    <th className="px-4 py-2 text-left font-medium">Grade</th>
                                    <th className="px-4 py-2 text-left font-medium">Date</th>
                                    <th className="px-4 py-2 text-left font-medium">Description</th>
                                    <th className="px-4 py-2 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((grade) => (
                                    <tr key={grade.id} className="border-t">
                                        <td className="px-4 py-2">{grade.subject}</td>
                                        <td className="px-4 py-2">{grade.grade}</td>
                                        <td className="px-4 py-2">{new Date(grade.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2">{grade.description}</td>
                                        <td className="px-4 py-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleDeleteClick(grade.id)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 size={16} />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <AddGradeDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                onAddGrade={handleAddGrade}
                existingSubjects={subjects}
            />
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected grade.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}