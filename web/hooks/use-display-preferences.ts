'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export type DisplayLabelPreference = 'averageGrade' | 'gpa';

/**
 * React hook that manages display label preferences and syncs between localStorage and Supabase
 * 
 * @returns {Object} The display preference state and setter
 */
export function useDisplayPreferences() {
  // Initialize with default or localStorage value
  const [displayLabel, setDisplayLabelState] = useState<DisplayLabelPreference>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('displayLabel');
      return (stored === 'averageGrade' || stored === 'gpa') ? stored : 'averageGrade';
    }
    return 'averageGrade';
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase on component mount
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.display_label) {
          const labelFromSupabase = user.user_metadata.display_label as DisplayLabelPreference;
          
          // Update state and localStorage
          setDisplayLabelState(labelFromSupabase);
          localStorage.setItem('displayLabel', labelFromSupabase);
        }
      } catch (error) {
        console.error('Error fetching display preference from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFromSupabase();
    
    // Listen for changes from other components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'displayLabel' && event.newValue) {
        const newLabel = event.newValue as DisplayLabelPreference;
        setDisplayLabelState(newLabel);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to update display preference
  const setDisplayLabel = async (newLabel: DisplayLabelPreference) => {
    // Update localStorage first for immediate UI update
    localStorage.setItem('displayLabel', newLabel);
    setDisplayLabelState(newLabel);
    
    try {
      // Then update Supabase
      const { saveDisplayLabelToSupabase } = await import('@/app/actions/display-preferences');
      await saveDisplayLabelToSupabase(newLabel);
      
      // Notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'displayLabel',
        newValue: newLabel
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving display preference:', error);
      return false;
    }
  };

  return { 
    displayLabel, 
    setDisplayLabel,
    isLoading
  };
}

/**
 * Get the appropriate label text based on the display preference
 * 
 * @param preference - The display preference
 * @returns The label text to display
 */
export function getDisplayLabel(preference: DisplayLabelPreference): string {
  switch (preference) {
    case 'gpa':
      return 'GPA';
    case 'averageGrade':
    default:
      return 'Average Grade';
  }
}

/**
 * Convert a grade value to display format based on preference
 * 
 * @param grade - The raw grade value in the current grade system
 * @param gradeSystem - The current grade system
 * @param displayPreference - The display preference
 * @returns The converted grade value for display
 */
export function convertGradeForDisplay(
  grade: number, 
  gradeSystem: 'american' | '6best' | '1best' | 'ib' | 'percentage', 
  displayPreference: DisplayLabelPreference
): number {
  if (displayPreference === 'averageGrade') {
    // Show raw value in current system
    return grade;
  }
  
  if (displayPreference === 'gpa') {
    // Convert to 4.0 GPA scale regardless of current system
    
    // First normalize to 0-1 scale (0 = worst, 1 = best)
    let normalized: number;
    
    switch (gradeSystem) {
      case '1best':
        // 1 is best, 6 is worst
        normalized = Math.max(0, Math.min(1, 1 - ((grade - 1) / 5)));
        break;
      case '6best':
        // 6 is best, 1 is worst  
        normalized = Math.max(0, Math.min(1, (grade - 1) / 5));
        break;
      case 'ib':
        // 7 is best, 1 is worst
        normalized = Math.max(0, Math.min(1, (grade - 1) / 6));
        break;
      case 'american':
        // Already on 4.0 scale, just clamp
        return Math.max(0, Math.min(4.0, grade));
      case 'percentage':
        // 100% is best, 0% is worst
        normalized = Math.max(0, Math.min(1, grade / 100));
        break;
      default:
        normalized = Math.max(0, Math.min(1, (grade - 1) / 5));
    }
    
    // Convert to 4.0 GPA scale
    return normalized * 4.0;
  }
  
  return grade;
}
