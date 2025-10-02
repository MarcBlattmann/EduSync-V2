"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Lock, Shield, CheckCircle2, UserCircle, Palette, Upload, Loader2, FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useGradeSystem, GradeSystem } from "@/hooks/use-grade-system";
import { useDisplayPreferences, DisplayLabelPreference } from "@/hooks/use-display-preferences";
import { useSemesterDefault, getSemesterDefaultLabel } from "@/hooks/use-semester-default";
import { useSubjectPreferences, getSubjectFilterLabel } from "@/hooks/use-subject-preferences";
import { useBetaFeatures } from "@/hooks/use-beta-features";
import { useSemesters } from "@/contexts/semester-context";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from "@/components/ui/checkbox";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [activeTab, setActiveTab] = useState("profile");  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);  const { gradeSystem, setGradeSystem, isLoading: isGradeSystemLoading } = useGradeSystem(); // Use the grade system hook instead of local state
  const { displayLabel, setDisplayLabel, isLoading: isDisplayPreferencesLoading } = useDisplayPreferences(); // Use the display preferences hook
  const { defaultSemester, setDefaultSemester, isLoading: isSemesterDefaultLoading } = useSemesterDefault(); // Use the semester default hook
  const { subjectFilter, setSubjectFilter, isLoading: isSubjectFilterLoading } = useSubjectPreferences(); // Use the subject filter hook
  const { betaFeatures, setBetaFeatures, isLoading: isBetaFeaturesLoading } = useBetaFeatures(); // Use the beta features hook
  const { semesters, activeSemester, isLoading: isSemestersLoading } = useSemesters(); // Get semesters for the dropdown

  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/sign-in");
          return;
        }
        
        setUser(user);
        setEmail(user.email || "");
        
        // Get user metadata if available
        if (user.user_metadata) {
          setFullName(user.user_metadata.full_name || "");
          setAvatar(user.user_metadata.avatar_url || "");
          
          // Grade system is now handled by the useGradeSystem hook
          // so we don't need to manage it manually here
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const handleProfileSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        }
      });
      
      if (error) {
        throw error;
      }
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };
  
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setSaveSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };  // Save grade system to both localStorage and Supabase using our hook
  const handleGradeSystemChange = async (newSystem: GradeSystem) => {
    setIsSaving(true);
    
    try {
      // Use the setGradeSystem function from our hook
      // This will update both localStorage and Supabase
      const success = await setGradeSystem(newSystem);
      
      if (!success) {
        throw new Error('Failed to save grade system');
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving grade system:", error);
      alert("Failed to save grade system preference");
    } finally {
      setIsSaving(false);
    }
  };
  // Save display label preference using our hook
  const handleDisplayLabelChange = async (newLabel: DisplayLabelPreference) => {
    setIsSaving(true);
    
    try {
      // Use the setDisplayLabel function from our hook
      // This will update both localStorage and Supabase
      const success = await setDisplayLabel(newLabel);
      
      if (!success) {
        throw new Error('Failed to save display label preference');
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving display label preference:", error);
      alert("Failed to save display label preference");
    } finally {
      setIsSaving(false);
    }
  };
  // Save semester default preference using our hook
  const handleSemesterDefaultChange = async (newDefault: string) => {
    setIsSaving(true);
    
    try {
      // Use the setDefaultSemester function from our hook
      // This will update both localStorage and Supabase
      const success = await setDefaultSemester(newDefault);
      
      if (!success) {
        throw new Error('Failed to save semester default preference');
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving semester default preference:", error);
      alert("Failed to save semester default preference");
    } finally {
      setIsSaving(false);
    }
  };

  // Save subject filter preference using our hook
  const handleSubjectFilterChange = async (newFilter: string) => {
    setIsSaving(true);
    
    try {
      // Use the setSubjectFilter function from our hook
      // This will update both localStorage and Supabase
      const success = await setSubjectFilter(newFilter as 'all' | 'active-semester');
      
      if (!success) {
        throw new Error('Failed to save subject filter preference');
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving subject filter preference:", error);
      alert("Failed to save subject filter preference");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle beta feature
  const handleBetaFeatureToggle = async (feature: 'schoolsEnabled', enabled: boolean) => {
    setIsSaving(true);
    
    try {
      const success = await setBetaFeatures({ [feature]: enabled });
      
      if (!success) {
        throw new Error('Failed to save beta feature preference');
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving beta feature preference:", error);
      alert("Failed to save beta feature preference");
    } finally {
      setIsSaving(false);
    }
  };

  // Navigation items for settings
  const navigationItems = [
    { 
      id: "profile", 
      label: "Profile", 
      icon: <UserCircle className="h-4 w-4 mr-2" />,
      description: "Manage your personal information"
    },    { 
      id: "security", 
      label: "Security", 
      icon: <Lock className="h-4 w-4 mr-2" />,
      description: "Security settings and two-factor authentication" 
    },
    { 
      id: "appearance", 
      label: "Appearance", 
      icon: <Palette className="h-4 w-4 mr-2" />,
      description: "Customize how EduSync looks" 
    },
    { 
      id: "system", 
      label: "System", 
      icon: <Shield className="h-4 w-4 mr-2" />, 
      description: "General preferences like grade system" 
    },
  ];

  // Calculate initials for avatar fallback
  const initials = fullName
    ? fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
    : email.charAt(0).toUpperCase();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          Settings
        </div>
      </header>
      
      <div className="flex flex-col gap-6 px-6 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-2xl font-bold">Account Settings</h2>
          
          {!isLoading && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {avatar ? (
                  <AvatarImage src={avatar} alt={fullName || email} />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{fullName || 'User'}</div>
                <div className="text-muted-foreground text-xs">{email}</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar navigation for settings */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Settings</CardTitle>
                <CardDescription className="text-xs">Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      className={cn(
                        "flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-accent/50",
                        activeTab === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => setActiveTab(item.id)}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Right content area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-primary" />
                      <CardTitle>Profile Information</CardTitle>
                    </div>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input 
                            id="fullName" 
                            placeholder="Your name" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="max-w-md"
                          />
                          <p className="text-xs text-muted-foreground">Your name will be displayed on your profile and in notifications.</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" value={email} readOnly disabled className="max-w-md" />
                          <p className="text-xs text-muted-foreground">Your email is tied to your authentication and cannot be changed here.</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 border-t px-6 py-4">
                    {saveSuccess && activeTab === "profile" && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        <span className="text-sm">Profile updated successfully</span>
                      </div>
                    )}
                    <Button 
                      disabled={isLoading || isSaving} 
                      onClick={handleProfileSave}
                      className={cn(
                        "sm:ml-auto order-1 sm:order-2",
                        saveSuccess && activeTab === "profile" ? "bg-green-600 hover:bg-green-700" : ""
                      )}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
              {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle>Two-Factor Authentication</CardTitle>
                    </div>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-factor authentication</h4>
                        <p className="text-sm text-muted-foreground">Protect your account with an additional verification step.</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">Coming Soon</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      <CardTitle>Theme Preferences</CardTitle>
                    </div>
                    <CardDescription>
                      Customize the application appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Select Theme</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div 
                          className={cn(
                            "border rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors",
                            theme === "light" ? "border-primary bg-accent/50" : ""
                          )}
                          onClick={() => handleThemeChange("light")}
                        >
                          <div className="h-12 w-full rounded-md bg-[#ffffff] border"></div>
                          <span className="text-sm">Light</span>
                        </div>
                        
                        <div 
                          className={cn(
                            "border rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors",
                            theme === "dark" ? "border-primary bg-accent/50" : ""
                          )}
                          onClick={() => handleThemeChange("dark")}
                        >
                          <div className="h-12 w-full rounded-md bg-[#121212] border"></div>
                          <span className="text-sm">Dark</span>
                        </div>
                        
                        <div 
                          className={cn(
                            "border rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors",
                            theme === "system" ? "border-primary bg-accent/50" : ""
                          )}
                          onClick={() => handleThemeChange("system")}
                        >
                          <div className="h-12 w-full rounded-md bg-gradient-to-r from-[#ffffff] to-[#121212] border"></div>
                          <span className="text-sm">System</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">System setting will follow your device's theme preference.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    {saveSuccess && activeTab === "appearance" && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        <span className="text-sm">Preferences saved</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </div>
            )}
              {/* System Settings */}
            {activeTab === "system" && (
              <div className="space-y-6">
                {/* Grade System Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle>Grade System</CardTitle>
                    </div>
                    <CardDescription>
                      Choose the grading system that matches your educational institution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <button
                        className={cn(
                          'border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors',
                          gradeSystem === '6best' ? 'border-primary bg-accent/50' : ''
                        )}
                        onClick={() => handleGradeSystemChange('6best')}
                        type="button"
                      >
                        <span className="text-lg font-bold">6</span>
                        <span className="text-xs text-center">6 is best</span>
                      </button>
                      <button
                        className={cn(
                          'border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors',
                          gradeSystem === '1best' ? 'border-primary bg-accent/50' : ''
                        )}
                        onClick={() => handleGradeSystemChange('1best')}
                        type="button"
                      >
                        <span className="text-lg font-bold">1</span>
                        <span className="text-xs text-center">1 is best</span>
                      </button>
                      <button
                        className={cn(
                          'border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors',
                          gradeSystem === 'ib' ? 'border-primary bg-accent/50' : ''
                        )}
                        onClick={() => handleGradeSystemChange('ib')}
                        type="button"
                      >
                        <span className="text-lg font-bold">7</span>
                        <span className="text-xs text-center">IB (1-7)</span>
                      </button>
                      <button
                        className={cn(
                          'border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors',
                          gradeSystem === 'american' ? 'border-primary bg-accent/50' : ''
                        )}
                        onClick={() => handleGradeSystemChange('american')}
                        type="button"
                      >
                        <span className="text-lg font-bold">A-F</span>
                        <span className="text-xs text-center">American</span>
                      </button>
                      <button
                        className={cn(
                          'border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors',
                          gradeSystem === 'percentage' ? 'border-primary bg-accent/50' : ''
                        )}
                        onClick={() => handleGradeSystemChange('percentage')}
                        type="button"
                      >
                        <span className="text-lg font-bold">%</span>
                        <span className="text-xs text-center">Percentage</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Preferences Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>
                      Customize how grades are displayed throughout the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        className={cn(
                          'border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors',
                          displayLabel === 'averageGrade' ? 'border-primary bg-accent/50' : ''
                        )}
                        onClick={() => handleDisplayLabelChange('averageGrade')}
                        type="button"
                      >
                        <span className="text-sm font-medium">Average Grade</span>
                        <span className="text-xs text-muted-foreground text-center">Show grades in original format</span>
                      </button>
                      <button
                        className={cn(
                          'border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors',
                          displayLabel === 'gpa' ? 'border-primary bg-accent/50' : ''
                        )}
                        onClick={() => handleDisplayLabelChange('gpa')}
                        type="button"
                      >
                        <span className="text-sm font-medium">GPA</span>
                        <span className="text-xs text-muted-foreground text-center">Convert to 4.0 scale</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Default Filters Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Default Filters</CardTitle>
                    <CardDescription>
                      Set your preferred default selections for viewing grades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Default Semester */}
                    <div>
                      <h4 className="font-medium mb-3 text-sm">Default Semester Selection</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            className={cn(
                              'border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-primary transition-colors',
                              defaultSemester === 'all' ? 'border-primary bg-accent/50' : ''
                            )}
                            onClick={() => handleSemesterDefaultChange('all')}
                            type="button"
                          >
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium">All Semesters</span>
                              <span className="text-xs text-muted-foreground">Show all time periods</span>
                            </div>
                            {defaultSemester === 'all' && (
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                          
                          <button
                            className={cn(
                              'border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-primary transition-colors',
                              defaultSemester === 'active' ? 'border-primary bg-accent/50' : ''
                            )}
                            onClick={() => handleSemesterDefaultChange('active')}
                            type="button"
                          >
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium">Active Semester</span>
                              <span className="text-xs text-muted-foreground">
                                {activeSemester ? `Currently: ${activeSemester.name}` : 'Current semester'}
                              </span>
                            </div>
                            {defaultSemester === 'active' && (
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        </div>

                        {semesters.length > 0 && (
                          <div>
                            <h5 className="text-xs text-muted-foreground font-medium mb-2">Specific Semester:</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {semesters.map((semester) => (
                                <button
                                  key={semester.id}
                                  className={cn(
                                    'border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-primary transition-colors text-left',
                                    defaultSemester === semester.id ? 'border-primary bg-accent/50' : ''
                                  )}
                                  onClick={() => handleSemesterDefaultChange(semester.id)}
                                  type="button"
                                >
                                  <div className="flex flex-col items-start min-w-0 flex-1">
                                    <span className="text-sm font-medium truncate w-full">{semester.name}</span>
                                    <span className="text-xs text-muted-foreground truncate w-full">
                                      {new Date(semester.start_date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        year: 'numeric' 
                                      })} - {new Date(semester.end_date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        year: 'numeric' 
                                      })}
                                    </span>
                                  </div>
                                  {defaultSemester === semester.id && (
                                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Applies to the Grade Overview and Grades page default view.
                      </p>
                    </div>

                    <Separator />

                    {/* Subject Filter */}
                    <div>
                      <h4 className="font-medium mb-3 text-sm">Subject Filter Preference</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          className={cn(
                            'border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-primary transition-colors',
                            subjectFilter === 'all' ? 'border-primary bg-accent/50' : ''
                          )}
                          onClick={() => handleSubjectFilterChange('all')}
                          type="button"
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">All Subjects</span>
                            <span className="text-xs text-muted-foreground">From all semesters</span>
                          </div>
                          {subjectFilter === 'all' && (
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                        
                        <button
                          className={cn(
                            'border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-primary transition-colors',
                            subjectFilter === 'active-semester' ? 'border-primary bg-accent/50' : ''
                          )}
                          onClick={() => handleSubjectFilterChange('active-semester')}
                          type="button"
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">Active Semester Only</span>
                            <span className="text-xs text-muted-foreground">
                              {activeSemester ? `From ${activeSemester.name}` : 'From current semester'}
                            </span>
                          </div>
                          {subjectFilter === 'active-semester' && (
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Controls which subjects appear in the Add Grade dialog dropdown.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Beta Features Section */}
                <Card className="border-orange-200 dark:border-orange-900">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-5 w-5 text-orange-500" />
                      <CardTitle className="flex items-center gap-2">
                        Beta Features
                        <Badge variant="outline" className="text-orange-500 border-orange-500">
                          Experimental
                        </Badge>
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Try out experimental features that are still in development. These features may change or be removed in future updates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Schools Feature Toggle */}
                    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="schools-toggle" className="text-sm font-medium cursor-pointer">
                            Schools Feature
                          </Label>
                          <Badge variant="secondary" className="text-xs">
                            Beta
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Organize your grades by educational institution. Perfect for students attending multiple schools or taking courses at different locations.
                        </p>
                      </div>
                      <Checkbox
                        id="schools-toggle"
                        checked={betaFeatures.schoolsEnabled}
                        onCheckedChange={(checked) => handleBetaFeatureToggle('schoolsEnabled', checked as boolean)}
                        disabled={isSaving}
                      />
                    </div>

                    {/* Warning Message */}
                    <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-3 border border-orange-200 dark:border-orange-900">
                      <p className="text-xs text-orange-800 dark:text-orange-200">
                        <strong>Note:</strong> Beta features are still under development and may not work as expected. Your feedback helps us improve these features!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Footer */}
                {(saveSuccess || isSaving) && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-center">
                        {saveSuccess && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            <span className="text-sm">Preferences saved successfully</span>
                          </div>
                        )}
                        {isSaving && (
                          <div className="flex items-center text-muted-foreground">
                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                            <span className="text-sm">Saving preferences...</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}