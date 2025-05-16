'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export type GradeSystem = '6best' | '1best';

/**
 * React hook that manages grade system state and syncs between localStorage and Supabase
 * 
 * @returns {Object} The grade system state and setter
 */
export function useGradeSystem() {
  // Initialize with default or localStorage value
  const [gradeSystem, setGradeSystemState] = useState<GradeSystem>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gradeSystem');
      return (stored === '1best' || stored === '6best') 
        ? stored 
        : '6best';
    }
    return '6best';
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Load from Supabase on component mount
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.grade_system) {
          const systemFromSupabase = user.user_metadata.grade_system as GradeSystem;
          
          // Update state and localStorage
          setGradeSystemState(systemFromSupabase);
          localStorage.setItem('gradeSystem', systemFromSupabase);
        }
      } catch (error) {
        console.error('Error fetching grade system from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFromSupabase();
    
    // Listen for changes from other components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'gradeSystem' && event.newValue) {
        const newSystem = event.newValue as GradeSystem;
        setGradeSystemState(newSystem);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Function to update grade system
  const setGradeSystem = async (newSystem: GradeSystem) => {
    // Update localStorage first for immediate UI update
    localStorage.setItem('gradeSystem', newSystem);
    setGradeSystemState(newSystem);
    
    try {
      // Then update Supabase
      const { saveGradeSystemToSupabase } = await import('@/app/actions/grade-system');
      await saveGradeSystemToSupabase(newSystem);
      
      // Notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'gradeSystem',
        newValue: newSystem
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving grade system:', error);
      return false;
    }
  };
  
  return { 
    gradeSystem, 
    setGradeSystem,
    isLoading
  };
}

/**
 * Get the grade color based on the grade value and system
 * 
 * @param grade - The grade value
 * @param system - The grade system (6best or 1best)
 * @returns CSS class for the appropriate text color
 */
export function getGradeColor(grade: number, system: GradeSystem): string {
  if (system === '1best') {
    if (grade <= 2) return "text-green-600 dark:text-green-400";
    if (grade <= 4) return "text-orange-500 dark:text-orange-300";
    return "text-red-600 dark:text-red-400";
  } else {
    if (grade >= 5) return "text-green-600 dark:text-green-400";
    if (grade >= 4) return "text-orange-500 dark:text-orange-300";
    return "text-red-600 dark:text-red-400";
  }
}
