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
import { Suspense } from "react";

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

// Define summary grade data type
interface GradeSummary {
  subject: string;
  grade: number;
}

// Define subject total interface
interface SubjectTotal {
  sum: number;
  count: number;
}

// Define grade stats returned from stored procedure
interface GradeStats {
  average_grade: number;
  subject_averages: Record<string, number>;
  total_entries: number;
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

// Helper function for text color based on grade
const getGradeColor = (grade: number): string => {
  if (grade >= 5) return "text-green-600 dark:text-green-400";
  if (grade >= 4) return "text-orange-500 dark:text-orange-300";
  return "text-red-600 dark:text-red-400";
};

// Component to fetch and display grade stats - separate from main content
async function GradeStats({ userId }: { userId: string }) {
  const supabase = await createClient();
  
  try {
    // Try to use optimized stored procedure - much more efficient
    const { data: gradeStats, error: procError } = await supabase.rpc('get_grade_stats', { 
      user_id_param: userId 
    }).maybeSingle();
    
    if (gradeStats) {
      // Use the optimized procedure results
      const typedGradeStats = gradeStats as unknown as GradeStats;
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Grade Overview</CardTitle>
            <CardDescription>Your current academic performance</CardDescription>
          </CardHeader>
          <CardContent>
            {typedGradeStats.total_entries === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>No grades available</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Grade</p>
                    <div className={`text-3xl font-bold ${getGradeColor(typedGradeStats.average_grade)}`}>
                      {typedGradeStats.average_grade.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                    <div className="text-3xl font-bold">{typedGradeStats.total_entries}</div>
                  </div>
                </div>
                
                {Object.keys(typedGradeStats.subject_averages || {}).length > 0 && (
                  <div>
                    <p className="text-sm font-medium border-b pb-1 mb-2">Top Subjects</p>
                    <div className="space-y-1">
                      {Object.entries(typedGradeStats.subject_averages)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([subject, average]) => (
                          <div key={subject} className="flex justify-between items-center">
                            <span className="font-medium truncate mr-2">{subject}</span>
                            <span className={`font-semibold ${getGradeColor(average)}`}>
                              {typeof average === 'number' ? average.toFixed(2) : average}
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
      );
    }
    
    // If stored procedure isn't available, use more efficient direct query
    const { data: summaryData, error } = await supabase
      .from('grades')
      .select('subject, grade')
      .eq('user_id', userId)
      .limit(50);
    
    if (error) {
      console.error('Error fetching grades:', error);
      return <GradeStatsError />;
    }
    
    if (!summaryData || summaryData.length === 0) {
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Grade Overview</CardTitle>
            <CardDescription>Your current academic performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              <p>No grades available</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Calculate metrics efficiently
    const totalEntries = summaryData.length;
    const sum = summaryData.reduce((acc: number, grade: GradeSummary) => acc + grade.grade, 0);
    const averageGrade = parseFloat((sum / totalEntries).toFixed(2));
    
    // Calculate subject averages - do this once rather than repeatedly in render
    const subjectTotals: Record<string, SubjectTotal> = {};
    const subjectAverages: Record<string, number> = {};
    
    summaryData.forEach((grade: GradeSummary) => {
      if (!subjectTotals[grade.subject]) {
        subjectTotals[grade.subject] = { sum: 0, count: 0 };
      }
      subjectTotals[grade.subject].sum += grade.grade;
      subjectTotals[grade.subject].count += 1;
    });
    
    Object.entries(subjectTotals).forEach(([subject, data]) => {
      subjectAverages[subject] = parseFloat((data.sum / data.count).toFixed(2));
    });
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Grade Overview</CardTitle>
          <CardDescription>Your current academic performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Average Grade</p>
              <div className={`text-3xl font-bold ${getGradeColor(averageGrade)}`}>
                {averageGrade}
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
        </CardContent>
      </Card>
    );
  } catch (e) {
    console.error('Error in GradeStats component:', e);
    return <GradeStatsError />;
  }
}

// Simple error state component
function GradeStatsError() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Grade Overview</CardTitle>
        <CardDescription>Your current academic performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          <p>Unable to load grades</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Component to fetch and display upcoming events
async function UpcomingEventsCard({ userId }: { userId: string }) {
  const supabase = await createClient();
  
  const { data: eventsData } = await supabase
    .from('calendar_events')
    .select('id, title, description, start_date, end_date, color, created_at')
    .eq('user_id', userId)
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(5);
    
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Your scheduled calendar events</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pb-6">
        <UpcomingEvents events={eventsData || []} />
      </CardContent>
    </Card>
  );
}

// Loading fallback components
function GradeStatsLoading() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Grade Overview</CardTitle>
        <CardDescription>Your current academic performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Average Grade</p>
              <div className="h-8 w-16 bg-muted rounded-md"></div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <div className="h-8 w-16 bg-muted rounded-md"></div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium border-b pb-1 mb-2">Top Subjects</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-muted rounded-md"></div>
                <div className="h-4 w-8 bg-muted rounded-md"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-muted rounded-md"></div>
                <div className="h-4 w-8 bg-muted rounded-md"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-muted rounded-md"></div>
                <div className="h-4 w-8 bg-muted rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EventsCardLoading() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Your scheduled calendar events</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pb-6">
        <div className="animate-pulse flex flex-col gap-2 flex-grow">
          <div className="h-16 bg-muted rounded-md"></div>
          <div className="h-16 bg-muted rounded-md"></div>
          <div className="h-16 bg-muted rounded-md"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

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
          <Suspense fallback={<GradeStatsLoading />}>
            <GradeStats userId={user.id} />
          </Suspense>
          
          <Suspense fallback={<EventsCardLoading />}>
            <UpcomingEventsCard userId={user.id} />
          </Suspense>
          
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        {/* Reduced height placeholder - was causing layout performance issues */}
        <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
