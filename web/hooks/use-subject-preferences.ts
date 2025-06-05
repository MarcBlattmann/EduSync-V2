'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export type SubjectFilterPreference = 'all' | 'active-semester';

/**
 * React hook that manages subject filtering preferences and syncs between localStorage and Supabase
 * 
 * @returns {Object} The subject filter preference state and setter
 */
export function useSubjectPreferences() {
  // Initialize with default or localStorage value
  const [subjectFilter, setSubjectFilterState] = useState<SubjectFilterPreference>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('subjectFilter');
      return stored as SubjectFilterPreference || 'active-semester';
    }
    return 'active-semester';
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase on component mount
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.subject_filter) {
          const subjectFilterFromSupabase = user.user_metadata.subject_filter as SubjectFilterPreference;
          
          // Update state and localStorage
          setSubjectFilterState(subjectFilterFromSupabase);
          localStorage.setItem('subjectFilter', subjectFilterFromSupabase);
        }
      } catch (error) {
        console.error('Error fetching subject filter preference from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFromSupabase();
    
    // Listen for changes from other components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'subjectFilter' && event.newValue) {
        const newFilter = event.newValue as SubjectFilterPreference;
        setSubjectFilterState(newFilter);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to update subject filter preference
  const setSubjectFilter = async (newFilter: SubjectFilterPreference) => {
    // Update localStorage first for immediate UI update
    localStorage.setItem('subjectFilter', newFilter);
    setSubjectFilterState(newFilter);
    
    try {
      // Then update Supabase
      const { saveSubjectFilterToSupabase } = await import('../app/actions/subject-preferences');
      await saveSubjectFilterToSupabase(newFilter);
      
      // Notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'subjectFilter',
        newValue: newFilter
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving subject filter preference:', error);
      return false;
    }
  };

  return { 
    subjectFilter, 
    setSubjectFilter,
    isLoading
  };
}

/**
 * Get the display label for a subject filter preference
 * 
 * @param preference - The subject filter preference
 * @returns The display label
 */
export function getSubjectFilterLabel(preference: SubjectFilterPreference): string {
  switch (preference) {
    case 'all':
      return 'All Subjects';
    case 'active-semester':
      return 'Active Semester Only';
    default:
      return 'Active Semester Only';
  }
}
