/**
 * React hook for managing school filter preferences
 * Syncs between localStorage and Supabase user metadata
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { saveSchoolFilterToSupabase } from '@/app/actions/school-preferences';

export type SchoolFilterPreference = 'all' | 'specific-school' | 'no-school';

/**
 * React hook that manages school filtering preferences and syncs between localStorage and Supabase
 * 
 * @returns {Object} The school filter preference state and setter
 */
export function useSchoolPreferences() {
  // Initialize with default or localStorage value
  const [schoolFilter, setSchoolFilterState] = useState<SchoolFilterPreference>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('schoolFilter');
      return stored as SchoolFilterPreference || 'all';
    }
    return 'all';
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase on component mount
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.school_filter) {
          const schoolFilterFromSupabase = user.user_metadata.school_filter as SchoolFilterPreference;
          setSchoolFilterState(schoolFilterFromSupabase);
          localStorage.setItem('schoolFilter', schoolFilterFromSupabase);
        }
      } catch (error) {
        console.error('Error fetching school filter from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFromSupabase();
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'schoolFilter' && e.newValue) {
        setSchoolFilterState(e.newValue as SchoolFilterPreference);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to update school filter preference
  const setSchoolFilter = async (newFilter: SchoolFilterPreference) => {
    // Update localStorage first for immediate UI update
    localStorage.setItem('schoolFilter', newFilter);
    setSchoolFilterState(newFilter);
    
    try {
      // Then update Supabase
      await saveSchoolFilterToSupabase(newFilter);
      
      // Notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'schoolFilter',
        newValue: newFilter
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving school filter:', error);
      return false;
    }
  };

  return { 
    schoolFilter, 
    setSchoolFilter,
    isLoading
  };
}
