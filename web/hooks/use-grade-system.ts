'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export type GradeSystem = '6best' | '1best' | 'american' | 'percentage' | 'ib';

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
      if (stored === '1best' || stored === '6best' || stored === 'american' || stored === 'percentage' || stored === 'ib') {
        return stored;
      }
      return '6best';
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
 * @param system - The grade system ('6best', '1best', 'american', 'percentage', 'ib')
 * @returns CSS class for the appropriate text color
 */
export function getGradeColor(grade: number, system: GradeSystem): string {
  switch (system) {
    case '1best':
      if (grade <= 2) return "text-green-600 dark:text-green-400";
      if (grade <= 4) return "text-orange-500 dark:text-orange-300";
      return "text-red-600 dark:text-red-400";
    
    case 'ib':
      // IB system: 1-7, 7 is best
      if (grade >= 6) return "text-green-600 dark:text-green-400";      // Excellent (6-7)
      if (grade >= 4) return "text-orange-500 dark:text-orange-300";    // Good (4-5)
      return "text-red-600 dark:text-red-400";                         // Needs improvement (1-3)
    
    case 'american':
      // American letter grade system (A=4.0, B=3.0, etc.)      if (grade >= 4) return "text-green-600 dark:text-green-400";      // A (4.0-3.7)
      if (grade >= 3) return "text-green-500 dark:text-green-300";      // B (3.3-3.0)
      if (grade >= 2) return "text-yellow-500 dark:text-yellow-300";    // C (2.7-2.0)
      if (grade >= 1) return "text-orange-500 dark:text-orange-300";    // D (1.7-1.0)
      return "text-red-600 dark:text-red-400";                         // F (0.0)
    
    case 'percentage':
      // Percentage-based system (0-100)
      if (grade >= 90) return "text-green-600 dark:text-green-400";     // A (90-100%)
      if (grade >= 80) return "text-green-500 dark:text-green-300";     // B (80-89%)
      if (grade >= 70) return "text-yellow-500 dark:text-yellow-300";   // C (70-79%)
      if (grade >= 60) return "text-orange-500 dark:text-orange-300";   // D (60-69%)
      return "text-red-600 dark:text-red-400";                         // F (0-59%)
    
    case '6best':
    default:
      // Default 6 best system
      if (grade >= 5) return "text-green-600 dark:text-green-400";
      if (grade >= 4) return "text-orange-500 dark:text-orange-300";
      return "text-red-600 dark:text-red-400";
  }
}

/**
 * Format a numerical grade to the appropriate string representation
 * based on the chosen grade system
 * 
 * @param grade - Numerical grade value
 * @param system - The grade system to use for formatting
 * @returns Formatted grade string
 */
export function formatGrade(grade: number, system: GradeSystem): string {
  switch (system) {
    case 'american':
      // Convert numerical value to letter grade
      if (grade >= 4.0) return 'A';
      if (grade >= 3.7) return 'A-';
      if (grade >= 3.3) return 'B+';
      if (grade >= 3.0) return 'B';
      if (grade >= 2.7) return 'B-';
      if (grade >= 2.3) return 'C+';      if (grade >= 2.0) return 'C';
      if (grade >= 1.7) return 'C-';
      if (grade >= 1.3) return 'D+';
      if (grade >= 1.0) return 'D';
      if (grade >= 0.7) return 'D-';
      return 'F';
    
    case 'percentage':
      // Format as percentage
      return `${Math.round(grade)}%`;
    
    case 'ib':
      // IB grades are whole numbers from 1-7
      return Math.round(grade).toString();
    
    case '6best':
    case '1best':
    default:
      // For numerical systems, just return the number
      return grade.toString();
  }
}

/**
 * Get the grade range for the selected grading system
 * 
 * @param system - The grade system
 * @returns Object containing min and max values for the system
 */
export function getGradeRange(system: GradeSystem): { min: number, max: number, step: number } {
  switch (system) {
    case '1best':
      return { min: 0, max: 6, step: 0.01 };
    case '6best':
      return { min: 0, max: 6, step: 0.01 };
    case 'ib':      return { min: 1, max: 7, step: 0.01 };
    case 'american':
      return { min: 0, max: 4, step: 0.01 }; // More precise steps for flexibility
    case 'percentage':
      return { min: 0, max: 100, step: 0.01 };
    default:
      return { min: 0, max: 6, step: 0.01 };
  }
}

/**
 * Convert a grade from one system to another
 * 
 * @param grade - The grade value to convert
 * @param fromSystem - The source grade system
 * @param toSystem - The target grade system
 * @returns The converted grade value
 */
export function convertGrade(grade: number, fromSystem: GradeSystem, toSystem: GradeSystem): number {
  // If same system, no conversion needed
  if (fromSystem === toSystem) return grade;
  
  // First, convert to a normalized 0-1 scale for easier mapping
  let normalized: number;
    // Convert from source system to normalized 0-1 scale (0 = worst, 1 = best)
  switch (fromSystem) {
    case '1best':
      // 1 is best, 6 is worst
      normalized = 1 - ((grade - 1) / 5);
      break;
    case '6best':
      // 6 is best, 1 is worst
      normalized = (grade - 1) / 5;
      break;
    case 'ib':
      // IB: 7 is best, 1 is worst
      normalized = (grade - 1) / 6;
      break;
    case 'american':
      // A(4.0) is best, F(0) is worst
      normalized = grade / 4.0;      break;
    case 'percentage':
      // 100% is best, 0% is worst
      normalized = grade / 100;
      break;
    default:
      normalized = (grade - 1) / 5; // Default to 6best scale
  }
  
  // Clamp to 0-1 range
  normalized = Math.max(0, Math.min(1, normalized));
    // Convert from normalized 0-1 scale to target system
  switch (toSystem) {
    case '1best':
      // 1 is best, 6 is worst
      return 1 + (5 * (1 - normalized));
    case '6best':
      // 6 is best, 1 is worst
      return 1 + (5 * normalized);    case 'ib':
      // IB: 7 is best, 1 is worst
      return 1 + (6 * normalized);
    case 'american':
      // A(4.0) is best, F(0) is worst
      return 4.0 * normalized;
    case 'percentage':
      // 100% is best, 0% is worst
      return 100 * normalized;
    default:
      return 1 + (5 * normalized); // Default to 6best scale
  }
}
