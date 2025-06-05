'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export type SemesterDefaultPreference = 'all' | 'active' | string; // string for specific semester ID

/**
 * React hook that manages semester default preferences and syncs between localStorage and Supabase
 * 
 * @returns {Object} The semester default preference state and setter
 */
export function useSemesterDefault() {
  // Initialize with default or localStorage value
  const [defaultSemester, setDefaultSemesterState] = useState<SemesterDefaultPreference>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('defaultSemester');
      return stored || 'active';
    }
    return 'active';
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase on component mount
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.default_semester) {
          const semesterFromSupabase = user.user_metadata.default_semester as SemesterDefaultPreference;
          
          // Update state and localStorage
          setDefaultSemesterState(semesterFromSupabase);
          localStorage.setItem('defaultSemester', semesterFromSupabase);
        }
      } catch (error) {
        console.error('Error fetching semester default preference from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFromSupabase();
    
    // Listen for changes from other components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'defaultSemester' && event.newValue) {
        const newSemester = event.newValue as SemesterDefaultPreference;
        setDefaultSemesterState(newSemester);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to update semester default preference
  const setDefaultSemester = async (newSemester: SemesterDefaultPreference) => {
    // Update localStorage first for immediate UI update
    localStorage.setItem('defaultSemester', newSemester);
    setDefaultSemesterState(newSemester);
    
    try {
      // Then update Supabase
      const { saveSemesterDefaultToSupabase } = await import('../app/actions/semester-preferences');
      await saveSemesterDefaultToSupabase(newSemester);
      
      // Notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'defaultSemester',
        newValue: newSemester
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving semester default preference:', error);
      return false;
    }
  };

  return { 
    defaultSemester, 
    setDefaultSemester,
    isLoading
  };
}

/**
 * Get the appropriate semester ID based on the default preference
 * 
 * @param preference - The default semester preference
 * @param semesters - Array of all semesters
 * @param activeSemester - The currently active semester
 * @returns The semester ID to use, or 'all' for all semesters
 */
export function getDefaultSemesterId(
  preference: SemesterDefaultPreference,
  semesters: Array<{ id: string; start_date: string; end_date: string }>,
  activeSemester: { id: string } | null
): string {
  switch (preference) {
    case 'all':
      return 'all';
    case 'active':
      return activeSemester?.id || 'all';
    default:
      // Check if the specific semester still exists
      const semesterExists = semesters.some(s => s.id === preference);
      return semesterExists ? preference : (activeSemester?.id || 'all');
  }
}

/**
 * Get the display label for a semester default preference
 * 
 * @param preference - The default semester preference
 * @param semesters - Array of all semesters  
 * @returns The display label
 */
export function getSemesterDefaultLabel(
  preference: SemesterDefaultPreference,
  semesters: Array<{ id: string; name: string }> = []
): string {
  switch (preference) {
    case 'all':
      return 'All Semesters';
    case 'active':
      return 'Active Semester';
    default:
      // Find specific semester name
      const semester = semesters.find(s => s.id === preference);
      return semester ? semester.name : 'Active Semester'; // Fallback if semester not found
  }
}
