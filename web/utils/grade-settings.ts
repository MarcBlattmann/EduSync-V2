import { createClient } from './supabase/client';

/**
 * Grade system types supported by the application
 */
export type GradeSystem = '6best' | '1best' | 'american' | 'gpa' | 'percentage' | 'ib';

/**
 * Get the user's preferred grade system from their Supabase metadata or localStorage
 * Falls back to '6best' if no preference is found
 * 
 * @returns Promise<GradeSystem> - The user's preferred grade system
 */
export async function getUserGradeSystem(): Promise<GradeSystem> {
  const supabase = createClient();
  
  try {
    // First try to get the grade system from the user's metadata in Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.user_metadata?.grade_system) {
      // Also sync to localStorage when we get it from Supabase
      if (typeof window !== 'undefined') {
        localStorage.setItem('gradeSystem', user.user_metadata.grade_system);
      }
      return user.user_metadata.grade_system as GradeSystem;
    }
      // If not available in user metadata or user not logged in, check localStorage
    if (typeof window !== 'undefined') {
      const localGradeSystem = localStorage.getItem('gradeSystem');
      if (localGradeSystem === '1best' || localGradeSystem === '6best' || 
          localGradeSystem === 'american' || localGradeSystem === 'gpa' || 
          localGradeSystem === 'percentage' || localGradeSystem === 'ib') {
        // If we found it in localStorage but not in Supabase, try to save it to Supabase
        if (user) {
          try {
            await saveGradeSystemToSupabase(localGradeSystem as GradeSystem);
          } catch (e) {
            // Silently fail if we can't save to Supabase
            console.error('Failed to sync localStorage grade system to Supabase:', e);
          }
        }
        return localGradeSystem as GradeSystem;
      }
    }
    
    // Default to '6best' if no preference found
    return '6best';
  } catch (error) {
    console.error('Error getting user grade system:', error);
    return '6best'; // Default fallback
  }
}

/**
 * Save the grade system preference to both localStorage and Supabase
 * 
 * @param system - The grade system to save
 * @returns Promise<boolean> - Whether the save was successful
 */
export async function saveGradeSystemToSupabase(system: GradeSystem): Promise<boolean> {
  // Save to localStorage for immediate use
  if (typeof window !== 'undefined') {
    localStorage.setItem('gradeSystem', system);
  }
  
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get current metadata to preserve other values
      const currentMetadata = user.user_metadata || {};
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          grade_system: system
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Dispatch a storage event so other tabs/components can react to the change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'gradeSystem',
          newValue: system
        }));
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving grade system to Supabase:', error);
    return false;
  }
}

/**
 * Utility function to check if a grade is "better" than another based on grade system
 * 
 * @param grade1 - First grade to compare
 * @param grade2 - Second grade to compare
 * @param system - Grade system to use for comparison ('6best' or '1best')
 * @returns Boolean - true if grade1 is better than grade2
 */
export function isBetterGrade(grade1: number, grade2: number, system: GradeSystem): boolean {    if (system === '6best') {
      return grade1 > grade2; // In 6best system, higher numbers are better
    } else if (system === 'ib') {
      return grade1 > grade2; // In IB system, higher numbers are better (7 is best)
    } else {
      return grade1 < grade2; // In 1best system, lower numbers are better
    }
}

/**
 * Sort grades based on the specified grade system
 * 
 * @param grades - Array of grade values to sort
 * @param system - Grade system to use for sorting ('6best' or '1best')
 * @returns number[] - Sorted array of grades (best first)
 */
export function sortGradesBySystem(grades: number[], system: GradeSystem): number[] {  return [...grades].sort((a, b) => {
    if (system === '6best' || system === 'ib') {
      return b - a; // Descending for 6best and IB (higher is better)
    } else {
      return a - b; // Ascending for 1best (lower is better)
    }
  });
}

/**
 * Get the grade system synchronously from localStorage
 * This is meant for UI components that can't use async functions easily
 * 
 * @returns GradeSystem - The grade system from localStorage or default
 */
export function getGradeSystemSync(): GradeSystem {
  if (typeof window !== 'undefined') {
    const system = localStorage.getItem('gradeSystem');
    if (system === '1best' || system === '6best' || system === 'american' || 
        system === 'gpa' || system === 'percentage' || system === 'ib') {
      return system;
    }
  }
  return '6best';
}

/**
 * Get text color for a grade based on the current grading system
 * 
 * @param grade - The grade to get a color for
 * @param system - The grade system to use
 * @returns string - CSS class for the appropriate text color
 */
export function getGradeColor(grade: number, system?: GradeSystem): string {
  const gradeSystem = system || getGradeSystemSync();
    if (gradeSystem === '1best') {
    if (grade <= 2) return "text-green-600 dark:text-green-400";
    if (grade <= 4) return "text-orange-500 dark:text-orange-300";
    return "text-red-600 dark:text-red-400";
  } else if (gradeSystem === 'ib') {
    if (grade >= 6) return "text-green-600 dark:text-green-400";
    if (grade >= 4) return "text-orange-500 dark:text-orange-300";
    return "text-red-600 dark:text-red-400";
  } else {
    if (grade >= 5) return "text-green-600 dark:text-green-400";
    if (grade >= 4) return "text-orange-500 dark:text-orange-300";
    return "text-red-600 dark:text-red-400";
  }
}
