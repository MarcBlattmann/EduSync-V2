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
        <section className="w-full py-12 md:py-16 lg:py-20 flex items-center">
          <div className="container px-4 md:px-6">
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
              <div className="flex items-center justify-center">
                <div className="relative w-full h-[350px] lg:h-[400px] xl:h-[500px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl transform rotate-2 shadow-xl"></div>
                  
                  <div className="absolute inset-0 transform -rotate-1 flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Abstract background elements */}
                      <div className="absolute top-[10%] left-[10%] w-40 h-40 rounded-full bg-blue-500/20 blur-xl"></div>
                      <div className="absolute bottom-[20%] right-[5%] w-32 h-32 rounded-full bg-green-500/20 blur-xl"></div>
                      <div className="absolute top-[40%] right-[20%] w-24 h-24 rounded-full bg-yellow-500/20 blur-xl"></div>
                      
                      {/* Main content overlapping cards */}
                      <div className="relative w-[90%] h-[80%] flex">
                        {/* Grade card */}
                        <div className="absolute top-[10%] left-[5%] w-[45%] bg-card rounded-xl shadow-lg border border-border p-5 z-10 transform -rotate-3">
                          <div className="flex items-center gap-2 mb-3">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Your Grades</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Physics</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 w-[92%]"></div>
                                </div>
                                <span className="font-medium text-green-500">1.2</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Math</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 w-[85%]"></div>
                                </div>
                                <span className="font-medium text-blue-500">1.5</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Biology</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-500 w-[78%]"></div>
                                </div>
                                <span className="font-medium text-yellow-500">2.0</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Calendar card */}
                        <div className="absolute top-[25%] right-[5%] w-[50%] bg-card rounded-xl shadow-lg border border-border p-5 z-20 transform rotate-2">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">April 2025</h3>
                            </div>
                            <div className="text-sm bg-primary/10 px-2 py-1 rounded-md text-primary font-medium">Today: 26</div>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                              <div key={`day-header-${idx}`} className="text-xs font-medium text-muted-foreground">{day}</div>
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
                                    relative aspect-square rounded-md flex flex-col items-center justify-center text-xs
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
                        
                        {/* Events card */}
                        <div className="absolute bottom-[15%] left-[15%] w-[40%] bg-card rounded-xl shadow-lg border border-border p-4 z-30 transform rotate-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <h3 className="font-semibold text-sm">Today's Events</h3>
                          </div>
                          <div className="bg-blue-500/10 rounded-lg p-3">
                            <p className="font-medium text-sm">Physics Class</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">Room 302</span>
                            </div>
                          </div>
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