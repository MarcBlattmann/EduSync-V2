"use client";

import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GradesTable } from "@/components/grades/grades-table";
import { AddGradeDialog } from "@/components/add-grade-dialog";
import { Button } from "@/components/ui/button";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Define types for the grade data
interface Grade {
  id: string;
  user_id: string;
  subject: string;
  grade: number;
  date: string;
  description: string; // Changed from optional to required to match dialog expectations
  created_at: string;
}

export default function Grades() {
  // Client-side state
  const [user, setUser] = useState<any>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [gradeToDelete, setGradeToDelete] = useState<string | null>(null);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [averageGrade, setAverageGrade] = useState<number | null>(null);
  const [subjectAverages, setSubjectAverages] = useState<Record<string, number>>({});
  
  // Initialize Supabase client
  const supabase = createClient();
  
  // Fetch user and grades on component mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      
      setUser(user);
      fetchGrades(user.id);
    };
    
    checkUser();
  }, []);
  
  // Fetch grades from Supabase
  const fetchGrades = async (userId: string) => {
    setIsLoading(true);
    
    const { data: gradesData, error } = await supabase
      .from('grades')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (error) {
      console.error("Error fetching grades:", error);
    } else if (gradesData) {
      // Ensure all grades have a description (handle potential nulls/undefined)
      const processedGrades = gradesData.map(grade => ({
        ...grade,
        description: grade.description || '' // Ensure description is never undefined
      }));
      
      setGrades(processedGrades);
      
      // Get unique subjects - fix for Set iteration issue
      const uniqueSubjectsSet = new Set<string>();
      processedGrades.forEach(grade => uniqueSubjectsSet.add(grade.subject));
      const uniqueSubjects = Array.from(uniqueSubjectsSet);
      setSubjects(uniqueSubjects);
      
      // Calculate averages
      if (processedGrades.length > 0) {
        const sum = processedGrades.reduce((acc, grade) => acc + grade.grade, 0);
        setAverageGrade(parseFloat((sum / processedGrades.length).toFixed(2)));
        
        // Calculate subject averages
        const subjectTotals: Record<string, { sum: number; count: number }> = {};
        processedGrades.forEach((grade) => {
          if (!subjectTotals[grade.subject]) {
            subjectTotals[grade.subject] = { sum: 0, count: 0 };
          }
          subjectTotals[grade.subject].sum += grade.grade;
          subjectTotals[grade.subject].count += 1;
        });
        
        const newSubjectAverages: Record<string, number> = {};
        Object.entries(subjectTotals).forEach(([subject, data]) => {
          newSubjectAverages[subject] = parseFloat((data.sum / data.count).toFixed(2));
        });
        
        setSubjectAverages(newSubjectAverages);
      } else {
        setAverageGrade(null);
        setSubjectAverages({});
      }
    }
    
    setIsLoading(false);
  };
  
  // Handle adding or editing a grade
  const handleAddGrade = async (gradeData: {
    subject: string;
    grade: number;
    date: string;
    description: string;
  }) => {
    if (!user) return;
    
    if (editingGrade) {
      // Update existing grade
      const { error } = await supabase
        .from('grades')
        .update({
          subject: gradeData.subject,
          grade: gradeData.grade,
          date: gradeData.date,
          description: gradeData.description
        })
        .eq('id', editingGrade.id);
      
      if (error) {
        console.error("Error updating grade:", error);
      } else {
        // Refresh grades list
        fetchGrades(user.id);
      }
      
      // Reset editing state
      setEditingGrade(null);
    } else {
      // Add new grade
      const { error } = await supabase
        .from('grades')
        .insert([{
          user_id: user.id,
          subject: gradeData.subject,
          grade: gradeData.grade,
          date: gradeData.date,
          description: gradeData.description
        }]);
      
      if (error) {
        console.error("Error adding grade:", error);
      } else {
        // Refresh grades list
        fetchGrades(user.id);
      }
    }
    
    // Close dialog
    setDialogOpen(false);
  };
  
  // Handle delete button click
  const handleDeleteClick = (gradeId: string) => {
    setGradeToDelete(gradeId);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!gradeToDelete || !user) return;
    
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', gradeToDelete);
    
    if (error) {
      console.error('Error deleting grade:', error);
    } else {
      // Refresh grades after deletion
      fetchGrades(user.id);
    }
    
    setDeleteDialogOpen(false);
    setGradeToDelete(null);
  };
  
  // Handle edit button click
  const handleEditClick = (grade: Grade) => {
    setEditingGrade(grade);
    setDialogOpen(true);
  };
  
  // Prepare data for the chart
  const prepareChartData = () => {
    // Sort grades by date (ascending)
    const sortedGrades = [...grades].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedGrades.map(grade => ({
      date: new Date(grade.date).toLocaleDateString(),
      grade: grade.grade,
      subject: grade.subject
    }));
  };

  // Get a color for each unique subject
  const getSubjectColors = () => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
    const subjectColors: Record<string, string> = {};
    
    subjects.forEach((subject, index) => {
      subjectColors[subject] = colors[index % colors.length];
    });
    
    return subjectColors;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 5) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (grade >= 4) return "bg-orange-200 text-orange-700 dark:bg-orange-800/50 dark:text-orange-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  const getAverageGradeTextColor = (grade: number) => {
    if (grade >= 5) return "text-green-600 dark:text-green-400";
    if (grade >= 4) return "text-orange-500 dark:text-orange-300";
    return "text-red-600 dark:text-red-400";
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
      
      <div className="flex flex-col gap-4 px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Stats Card */}
              <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-lg font-semibold">Grade Statistics</h3>
                  <p className="text-sm text-muted-foreground">Your overall performance</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Grade</p>
                    <div className={`text-3xl sm:text-4xl font-bold ${averageGrade ? getAverageGradeTextColor(averageGrade) : ''}`}>
                      {averageGrade ?? 'N/A'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                    <div className="text-3xl sm:text-4xl font-bold">{grades.length}</div>
                  </div>
                </div>
                
                {/* Subject Averages */}
                <div className="mt-6">
                  <p className="text-sm font-medium border-b pb-2 mb-2">Average by Subject</p>
                  <div className="overflow-y-auto max-h-40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                      {Object.entries(subjectAverages).map(([subject, average]) => (
                        <div key={subject} className="flex justify-between items-center pr-4">
                          <span className="font-medium truncate mr-2">{subject}:</span>
                          <span className={`font-semibold ${getAverageGradeTextColor(average)}`}>
                            {average}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chart Card */}
              <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-lg font-semibold">Grade History</h3>
                  <p className="text-sm text-muted-foreground">Performance over time</p>
                </div>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareChartData()}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[1, 6]} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                          color: 'hsl(var(--card-foreground))'
                        }}
                        labelStyle={{
                          color: 'hsl(var(--card-foreground))',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem'
                        }}
                        itemStyle={{
                          color: 'hsl(var(--card-foreground))'
                        }}
                      />
                      <Legend />
                      {subjects.map((subject) => (
                        <Line 
                          key={subject}
                          type="monotone"
                          dataKey={(data) => data.subject === subject ? data.grade : null}
                          name={subject}
                          stroke={getSubjectColors()[subject]}
                          activeDot={{ r: 8 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Use GradesTable component for a better experience with sorting and filtering */}
            <div className="my-4">
              <GradesTable 
                grades={grades} 
                subjects={subjects} 
                onEdit={handleEditClick}  
                onDelete={handleDeleteClick}
              />
            </div>

            {/* Mobile card view - keep this for mobile experience */}
            <div className="sm:hidden flex flex-col gap-3">
              {grades.map((grade) => (
                <div key={grade.id} className="border rounded-md p-3 bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{grade.subject}</h4>
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getGradeColor(grade.grade)}`}>
                      {grade.grade}
                    </span>
                  </div>
                  <div className="text-sm mb-1">
                    <span className="text-muted-foreground">Date: </span>
                    {new Date(grade.date).toLocaleDateString()}
                  </div>
                  {grade.description && (
                    <div className="text-sm mb-3">
                      <span className="text-muted-foreground">Description: </span>
                      {grade.description}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-2 border-t pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditClick(grade)}
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-primary"
                    >
                      <Pencil size={16} />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteClick(grade.id)}
                      className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <AddGradeDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onAddGrade={handleAddGrade}
        existingSubjects={subjects}
        editingGrade={editingGrade}
        isEditing={!!editingGrade}
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
  );
}