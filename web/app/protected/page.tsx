import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signOutAction } from "../actions";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingEvents } from "@/components/upcoming-events";

// Define types for the grade data
interface Grade {
  id: string;
  user_id: string;
  subject: string;
  grade: number;
  date: string;
  description?: string;
  created_at: string;
}

// Define calendar event type
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
  created_at: string;
  user_id: string;
}

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch grades data on the server
  const { data: gradesData } = await supabase
    .from('grades')
    .select('*')
    .eq('user_id', user.id);

  // Fetch upcoming events
  const { data: eventsData } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(5);

  // Calculate averages
  let averageGrade: number | null = null;
  let subjectAverages: Record<string, number> = {};
  let totalEntries = 0;

  if (gradesData && gradesData.length > 0) {
    totalEntries = gradesData.length;
    const sum = gradesData.reduce((acc: number, grade: Grade) => acc + grade.grade, 0);
    averageGrade = parseFloat((sum / gradesData.length).toFixed(2));
    
    const subjectTotals: Record<string, { sum: number; count: number }> = {};
    gradesData.forEach((grade: Grade) => {
      if (!subjectTotals[grade.subject]) {
        subjectTotals[grade.subject] = { sum: 0, count: 0 };
      }
      subjectTotals[grade.subject].sum += grade.grade;
      subjectTotals[grade.subject].count += 1;
    });
    
    Object.entries(subjectTotals).forEach(([subject, data]) => {
      subjectAverages[subject] = parseFloat((data.sum / data.count).toFixed(2));
    });
  }

  // Helper function for text color based on grade
  const getGradeColor = (grade: number): string => {
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
          Home
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-auto">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Grade Overview</CardTitle>
              <CardDescription>Your current academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              {!gradesData || gradesData.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <p>No grades available</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Grade</p>
                      <div className={`text-3xl font-bold ${averageGrade ? getGradeColor(averageGrade) : ""}`}>
                        {averageGrade ?? "N/A"}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Entries</p>
                      <div className="text-3xl font-bold">{totalEntries}</div>
                    </div>
                  </div>
                  
                  {Object.keys(subjectAverages).length > 0 && (
                    <div>
                      <p className="text-sm font-medium border-b pb-1 mb-2">Top Subjects</p>
                      <div className="space-y-1">
                        {Object.entries(subjectAverages)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([subject, average]) => (
                            <div key={subject} className="flex justify-between items-center">
                              <span className="font-medium truncate mr-2">{subject}</span>
                              <span className={`font-semibold ${getGradeColor(average)}`}>
                                {average}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Upcoming Events Card */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your scheduled calendar events</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col pb-6">
              <UpcomingEvents events={eventsData || []} />
            </CardContent>
          </Card>
          
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
