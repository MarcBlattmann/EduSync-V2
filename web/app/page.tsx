import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer";
import NavBar from "@/components/navBar";
import { Button } from "@/components/ui/button";
import { Calendar, GraduationCap } from "lucide-react";

export default async function Home() {
  return (
    <>
      <NavBar/>
      <main className="flex-1 flex flex-col w-full">
        {/* Hero Section */}
        <section className="w-full mt-10 mb-5 min-h-[calc(100vh-256px)] flex items-center justify-center">
          <div className="container px-4 md:px-6 flex">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Education Reimagined with EduSync
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Organize your academic schedule and track grades with our education management platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="px-8">
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="px-8">
                    <Link href="/sign-in">Log in</Link>
                  </Button>
                </div>
              </div>
              
              {/* Hero visualization - fixed size container that scales proportionally */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[550px] mx-auto aspect-[4/3]">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl transform rotate-2 shadow-xl"></div>
                  
                  {/* Abstract background elements - fixed positions */}
                  <div className="absolute top-[10%] left-[10%] w-[18%] h-[18%] rounded-full bg-blue-500/20 blur-xl"></div>
                  <div className="absolute bottom-[20%] right-[5%] w-[15%] h-[15%] rounded-full bg-green-500/20 blur-xl"></div>
                  <div className="absolute top-[40%] right-[20%] w-[10%] h-[10%] rounded-full bg-yellow-500/20 blur-xl"></div>
                  
                  {/* Grade card - fixed position and size */}
                  <div className="absolute top-[10%] left-[5%] w-[45%] bg-card rounded-xl shadow-lg border border-border p-[5%] z-10 transform -rotate-3">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-sm sm:text-base">Your Grades</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-xs sm:text-sm">Physics</span>
                        <div className="flex items-center gap-2">
                          <div className="w-12 sm:w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[92%]"></div>
                          </div>
                          <span className="font-medium text-green-500 text-xs sm:text-sm">1.2</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-xs sm:text-sm">Math</span>
                        <div className="flex items-center gap-2">
                          <div className="w-12 sm:w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[85%]"></div>
                          </div>
                          <span className="font-medium text-blue-500 text-xs sm:text-sm">1.5</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-xs sm:text-sm">Biology</span>
                        <div className="flex items-center gap-2">
                          <div className="w-12 sm:w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 w-[78%]"></div>
                          </div>
                          <span className="font-medium text-yellow-500 text-xs sm:text-sm">2.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Calendar card - fixed position and size - moved up */}
                  <div className="absolute top-[15%] right-[5%] w-[50%] bg-card rounded-xl shadow-lg border border-border p-[4%] z-20 transform rotate-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-xs sm:text-sm">April 2025</h3>
                      </div>
                      <div className="text-[10px] sm:text-xs bg-primary/10 px-2 py-1 rounded text-primary font-medium">Today: 26</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                        <div key={`day-header-${idx}`} className="text-[8px] sm:text-xs font-medium text-muted-foreground">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: 30 }, (_, i) => {
                        const day = i + 1;
                        const isToday = day === 26;
                        const hasEvent = [4, 10, 15, 26].includes(day);
                        const eventColor = day === 4 ? 'bg-blue-500/20 border-blue-500/30' : 
                                          day === 10 ? 'bg-green-500/20 border-green-500/30' :
                                          day === 15 ? 'bg-yellow-500/20 border-yellow-500/30' : 
                                          'bg-primary/20 border-primary/30';
                        
                        return (
                          <div 
                            key={`calendar-day-${day}`} 
                            className={`
                              relative aspect-square rounded-sm flex flex-col items-center justify-center text-[8px] sm:text-xs
                              ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                              ${hasEvent && !isToday ? `font-medium border ${eventColor}` : ''}
                            `}
                          >
                            {day}
                            {hasEvent && !isToday && <div className={`absolute -bottom-0.5 h-1 w-1 rounded-full ${day === 4 ? 'bg-blue-500' : day === 10 ? 'bg-green-500' : day === 15 ? 'bg-yellow-500' : 'bg-primary'}`}></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Events card - fixed position and size */}
                  <div className="absolute bottom-[15%] left-[15%] w-[40%] bg-card rounded-xl shadow-lg border border-border p-[4%] z-30 transform rotate-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <h3 className="font-semibold text-xs sm:text-sm">Today's Events</h3>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-3">
                      <p className="font-medium text-xs sm:text-sm">Physics Class</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">Room 302</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="w-full py-16 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Calendar visualization */}
              <div className="order-2 lg:order-1 relative">
                <div className="relative mx-auto w-full max-w-[500px] bg-card rounded-xl shadow-xl p-6 border border-border">
                  <div className="absolute -top-3 -left-3 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Smart Calendar
                      </h3>
                      <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-sm font-medium">May 2025</div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div key={`feature-day-${idx}`} className="text-xs font-medium text-muted-foreground">{day}</div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const isToday = day === 4;
                        const hasEvent = [4, 7, 12, 18, 25, 29].includes(day);
                        const eventColors: Record<number, string> = {
                          4: 'bg-primary/20 border-primary/30',
                          7: 'bg-green-500/20 border-green-500/30',
                          12: 'bg-blue-500/20 border-blue-500/30',
                          18: 'bg-yellow-500/20 border-yellow-500/30',
                          25: 'bg-purple-500/20 border-purple-500/30',
                          29: 'bg-red-500/20 border-red-500/30',
                        };
                        
                        // Get event color safely with fallback to empty string if day is not a key
                        const eventColor = hasEvent ? (eventColors[day] || '') : '';
                        
                        return (
                          <div 
                            key={`feature-calendar-day-${day}`} 
                            className={`
                              relative p-2 rounded-md flex flex-col items-center justify-center text-sm
                              ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                              ${hasEvent && !isToday ? `font-medium border ${eventColor}` : ''}
                            `}
                          >
                            {day}
                            {hasEvent && !isToday && <div className={`absolute -bottom-0.5 h-1.5 w-1.5 rounded-full ${
                              day === 7 ? 'bg-green-500' : 
                              day === 12 ? 'bg-blue-500' : 
                              day === 18 ? 'bg-yellow-500' : 
                              day === 25 ? 'bg-purple-500' : 
                              day === 29 ? 'bg-red-500' : 'bg-primary'
                            }`}></div>}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-medium">Upcoming Events:</h4>
                      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                        <div className="flex-shrink-0 w-48 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <p className="font-medium text-sm">Math Exam</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">May 7 • 10:00 AM</p>
                        </div>
                        <div className="flex-shrink-0 w-48 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                            <p className="font-medium text-sm">Group Project</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">May 12 • 2:30 PM</p>
                        </div>
                        <div className="flex-shrink-0 w-48 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <p className="font-medium text-sm">Science Lab</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">May 18 • 9:15 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Calendar content */}
              <div className="order-1 lg:order-2 flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block bg-primary/10 px-3 py-1 rounded-full text-primary text-sm font-medium mb-2">
                    Calendar Feature
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                    Never Miss an Important Date
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-lg dark:text-gray-400">
                    Our intuitive calendar system helps you keep track of classes, exams, assignments, and extracurricular activities all in one place.
                  </p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Color-coded events for different subjects and activities</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Set reminders for upcoming deadlines and exams</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Share your calendar with classmates or study groups</p>
                  </li>
                </ul>
                <div className="pt-4">
                  <Button asChild className="px-8">
                    <Link href="/sign-up">Try the Calendar</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grade Tracker Section */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Grade Tracker content */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block bg-green-500/10 px-3 py-1 rounded-full text-green-600 text-sm font-medium mb-2 dark:text-green-500">
                    Grade Tracker
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                    Track Your Academic Progress
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-lg dark:text-gray-400">
                    Log your grades with our numeric tracking system and visualize your progress over time.
                  </p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 dark:text-green-500 text-sm">✓</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">View subject-specific grade averages</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 dark:text-green-500 text-sm">✓</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Track performance trends with grade history charts</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 dark:text-green-500 text-sm">✓</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Record grades for all your subjects in one place</p>
                  </li>
                </ul>
                <div className="pt-4">
                  <Button asChild className="px-8 bg-green-600 hover:bg-green-700 text-white">
                    <Link href="/sign-up">Track Your Grades</Link>
                  </Button>
                </div>
              </div>
              
              {/* Grade Tracker visualization */}
              <div className="relative">
                <div className="relative mx-auto w-full max-w-[500px] bg-card rounded-xl shadow-xl p-6 border border-border">
                  <div className="absolute -top-5 -right-5 w-28 h-28 bg-green-500/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-500" />
                      <h3 className="text-xl font-bold">Grade Overview</h3>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-sm">Overall Average</h4>
                        <span className="font-bold text-lg text-green-600 dark:text-green-500">1.8</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[85%]"></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Best</span>
                        <span>Grade Scale: 1-6 (1 is best)</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Subject Performance</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">Mathematics</span>
                            <span className="font-medium text-sm">1.5</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[92%]"></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">Physics</span>
                            <span className="font-medium text-sm">1.2</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[95%]"></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">Literature</span>
                            <span className="font-medium text-sm">2.3</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 w-[80%]"></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">History</span>
                            <span className="font-medium text-sm">1.6</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[90%]"></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">Biology</span>
                            <span className="font-medium text-sm">2.5</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-[75%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sample grade history chart */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-sm">Recent Grade History</h4>
                      </div>
                      <div className="relative h-32 border-b border-l border-muted">
                        {/* Simulate chart lines */}
                        <div className="absolute bottom-0 left-0 w-full h-full">
                          {/* Math grade line */}
                          <svg className="w-full h-full overflow-visible">
                            <path d="M10,64 L38,32 L66,48 L94,16 L122,32 L150,24" 
                                  fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                            {/* Small dots at data points */}
                            <circle cx="10" cy="64" r="3" fill="#3b82f6" />
                            <circle cx="38" cy="32" r="3" fill="#3b82f6" />
                            <circle cx="66" cy="48" r="3" fill="#3b82f6" />
                            <circle cx="94" cy="16" r="3" fill="#3b82f6" />
                            <circle cx="122" cy="32" r="3" fill="#3b82f6" />
                            <circle cx="150" cy="24" r="3" fill="#3b82f6" />
                          </svg>
                          
                          {/* Physics grade line */}
                          <svg className="absolute inset-0 w-full h-full overflow-visible">
                            <path d="M10,56 L38,40 L66,24 L94,32 L122,16 L150,8" 
                                  fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                            {/* Small dots at data points */}
                            <circle cx="10" cy="56" r="3" fill="#a855f7" />
                            <circle cx="38" cy="40" r="3" fill="#a855f7" />
                            <circle cx="66" cy="24" r="3" fill="#a855f7" />
                            <circle cx="94" cy="32" r="3" fill="#a855f7" />
                            <circle cx="122" cy="16" r="3" fill="#a855f7" />
                            <circle cx="150" cy="8" r="3" fill="#a855f7" />
                          </svg>
                        </div>
                        
                        {/* Chart labels */}
                        <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between text-[10px] text-muted-foreground">
                          <span>Jan</span>
                          <span>Feb</span>
                          <span>Mar</span>
                          <span>Apr</span>
                          <span>May</span>
                        </div>
                        <div className="absolute top-0 left-[-20px] bottom-0 flex flex-col justify-between text-[10px] text-muted-foreground">
                          <span>1.0</span>
                          <span>3.0</span>
                          <span>6.0</span>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center justify-center mt-6 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>Mathematics</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span>Physics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  );
}