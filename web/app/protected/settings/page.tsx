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
import { Lock, Shield, CheckCircle2, UserCircle, Palette, Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { v4 as uuidv4 } from 'uuid';

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [gradeSystem, setGradeSystem] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gradeSystem') || '6best';
    }
    return '6best';
  });

  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    const checkUser = async () => {
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
  
  const handlePasswordChange = async () => {
    if (!passwordNew || passwordNew !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: passwordNew 
      });
      
      if (error) {
        throw error;
      }
      
      // Reset password fields
      setPasswordCurrent("");
      setPasswordNew("");
      setPasswordConfirm("");
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
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
  };

  // Save grade system to localStorage and (optionally) user metadata
  const handleGradeSystemChange = async (newSystem: string) => {
    setGradeSystem(newSystem);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gradeSystem', newSystem);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    // Optionally: Save to Supabase user metadata here
  };

  // Navigation items for settings
  const navigationItems = [
    { 
      id: "profile", 
      label: "Profile", 
      icon: <UserCircle className="h-4 w-4 mr-2" />,
      description: "Manage your personal information"
    },
    { 
      id: "security", 
      label: "Security", 
      icon: <Lock className="h-4 w-4 mr-2" />,
      description: "Update password and security settings" 
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
                  ))}
                </nav>
              </CardContent>
              <CardFooter className="p-4 pt-2 border-t flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  EduSync v2.0
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href="/protected">Back</Link>
                </Button>
              </CardFooter>
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
                      <Lock className="h-5 w-5 text-primary" />
                      <CardTitle>Password</CardTitle>
                    </div>
                    <CardDescription>
                      Change your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        value={passwordCurrent}
                        onChange={(e) => setPasswordCurrent(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        value={passwordNew}
                        onChange={(e) => setPasswordNew(e.target.value)}
                        className="max-w-md"
                      />
                      <p className="text-xs text-muted-foreground">Password must be at least 8 characters long.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 border-t px-6 py-4">
                    {saveSuccess && activeTab === "security" && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        <span className="text-sm">Password changed successfully</span>
                      </div>
                    )}
                    <Button 
                      disabled={isSaving} 
                      onClick={handlePasswordChange}
                      className={cn(
                        "sm:ml-auto",
                        saveSuccess && activeTab === "security" ? "bg-green-600 hover:bg-green-700" : ""
                      )}
                    >
                      {isSaving ? "Updating..." : "Update Password"}
                    </Button>
                  </CardFooter>
                </Card>
                
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
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle>System Preferences</CardTitle>
                    </div>
                    <CardDescription>
                      Set your preferred grading system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Grade System</h4>
                      <div className="grid grid-cols-2 gap-3 max-w-xs">
                        <button
                          className={cn(
                            'border rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors',
                            gradeSystem === '6best' ? 'border-primary bg-accent/50' : ''
                          )}
                          onClick={() => handleGradeSystemChange('6best')}
                          type="button"
                        >
                          <span className="text-lg font-bold">6</span>
                          <span className="text-xs">6 is best</span>
                        </button>
                        <button
                          className={cn(
                            'border rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors',
                            gradeSystem === '1best' ? 'border-primary bg-accent/50' : ''
                          )}
                          onClick={() => handleGradeSystemChange('1best')}
                          type="button"
                        >
                          <span className="text-lg font-bold">1</span>
                          <span className="text-xs">1 is best</span>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Choose which grade is considered the best for your system.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    {saveSuccess && activeTab === "system" && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        <span className="text-sm">Preferences saved</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}