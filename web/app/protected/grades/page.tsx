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
import { useGradeSystem, getGradeColor, convertGrade } from "@/hooks/use-grade-system";

// Define types for the grade data
interface Grade {
  id: string;
  user_id: string;
  subject: string;
  grade: number;
  date: string;
  description?: string; // Changed to optional to match grades-table component
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
  
  // Use our custom hook for grade system
  const { gradeSystem } = useGradeSystem();
  
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
    } else if (gradesData) {      // Process grades - handle null/undefined descriptions and convert grades to current system
      const standardGradeSystem = '6best' as const; // The system used for database storage
      const processedGrades = gradesData.map(grade => {
        // Convert the grade from the standard storage format to the current display format
        const convertedGrade = convertGrade(grade.grade, standardGradeSystem, gradeSystem);
        
        return {
          ...grade,
          originalGrade: grade.grade, // Keep original for reference
          grade: convertedGrade,      // Use the converted grade for display
          description: grade.description || '' // Ensure description is never undefined
        };
      });
      
      console.log(`Converted ${processedGrades.length} grades from ${standardGradeSystem} to ${gradeSystem} format`);
      
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
      try {
        // Log the data being sent to better debug
        console.log("Updating grade data:", {
          id: editingGrade.id,
          subject: gradeData.subject,
          grade: gradeData.grade,
          date: gradeData.date,
          description: gradeData.description,
          gradeSystem // Log the current grade system for reference
        });
        
        // Ensure grade is a valid number
        const numericGrade = parseFloat(gradeData.grade.toString());
        
        if (isNaN(numericGrade)) {
          throw new Error(`Invalid grade value: ${gradeData.grade}`);
        }

        // Convert the grade to a standard 1-6 scale for database storage
        // This ensures consistent storage regardless of the display format
        const standardGradeSystem = '6best' as const; // Use 6best as the standard storage format
        const adjustedGrade = convertGrade(numericGrade, gradeSystem, standardGradeSystem);
        
        console.log(`Converting grade from ${gradeSystem} system: ${numericGrade} → ${standardGradeSystem} system: ${adjustedGrade}`);
        
        // Make sure the converted grade is valid
        if (isNaN(adjustedGrade)) {
          throw new Error(`Grade conversion resulted in invalid value: ${adjustedGrade}`);
        }
        
        const { error, data } = await supabase
          .from('grades')
          .update({
            subject: gradeData.subject,
            grade: adjustedGrade,
            date: gradeData.date,
            description: gradeData.description
          })
          .eq('id', editingGrade.id)
          .select();
        
        if (error) {
          console.error("Database error updating grade:", {
            error,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        } else {
          console.log("Successfully updated grade:", data);
          // Refresh grades list
          fetchGrades(user.id);
        }
      } catch (err) {
        console.error("Error updating grade:", err);
      }
      
      // Reset editing state
      setEditingGrade(null);
    } else {      // Add new grade
      try {
        // Log the data being sent to better debug
        console.log("Sending grade data:", {
          user_id: user.id,
          subject: gradeData.subject,
          grade: gradeData.grade,
          date: gradeData.date,
          description: gradeData.description,
          gradeSystem // Log the current grade system for reference
        });
        
        // Ensure grade is a valid number
        const numericGrade = parseFloat(gradeData.grade.toString());
        
        if (isNaN(numericGrade)) {
          throw new Error(`Invalid grade value: ${gradeData.grade}`);
        }
        
        // Convert the grade to a standard 1-6 scale for database storage
        // This ensures consistent storage regardless of the display format
        const standardGradeSystem = '6best' as const; // Use 6best as the standard storage format
        const adjustedGrade = convertGrade(numericGrade, gradeSystem, standardGradeSystem);
        
        console.log(`Converting grade from ${gradeSystem} system: ${numericGrade} → ${standardGradeSystem} system: ${adjustedGrade}`);
        
        // Make sure the converted grade is valid
        if (isNaN(adjustedGrade)) {
          throw new Error(`Grade conversion resulted in invalid value: ${adjustedGrade}`);
        }
        
        const { error, data } = await supabase
          .from('grades')
          .insert([{
            user_id: user.id,
            subject: gradeData.subject,
            grade: adjustedGrade,
            date: gradeData.date,
            description: gradeData.description
          }])
          .select();
        
        if (error) {
          console.error("Database error adding grade:", {
            error,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        } else {
          console.log("Successfully added grade:", data);
          // Refresh grades list
          fetchGrades(user.id);
        }} catch (err) {
        // Provide more detailed error logging
        console.error("Error adding grade:", {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : 'No stack trace',
          gradeData,
          currentGradeSystem: gradeSystem
        });
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
  const getGradeBadgeColor = (grade: number) => {
    if (grade >= 5) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (grade >= 4) return "bg-orange-200 text-orange-700 dark:bg-orange-800/50 dark:text-orange-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };
  
  // Note: We're now using the gradeSystem from the useGradeSystem() hook
  // which is already declared at the top of the component.
  // Color for subject averages, adapts to grade system
  const getAverageGradeTextColor = (grade: number) => {
    // Use the imported getGradeColor function with the current gradeSystem
    return getGradeColor(grade, gradeSystem);
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
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />                      <YAxis
                        domain={gradeSystem === '1best' ? [1, 6] : gradeSystem === 'ib' ? [1, 7] : [1, 6]}
                        reversed={gradeSystem === '1best'}
                        tick={{ fontSize: 12 }}
                      />
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