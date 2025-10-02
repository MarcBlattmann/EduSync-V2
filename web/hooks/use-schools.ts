/**
 * React hook for managing schools
 * Provides CRUD operations and state management for schools
 * Only loads schools if the beta feature is enabled
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { School, CreateSchoolData, UpdateSchoolData, SchoolStats } from '@/types/school';
import { 
  createSchool as createSchoolAction,
  updateSchool as updateSchoolAction,
  deleteSchool as deleteSchoolAction,
  archiveSchool as archiveSchoolAction,
  unarchiveSchool as unarchiveSchoolAction
} from '@/app/actions/school';
import { useBetaFeatures } from './use-beta-features';

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [activeSchools, setActiveSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const { schoolsEnabled } = useBetaFeatures();

  // Fetch all schools for the current user
  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If schools feature is disabled, return empty arrays
      if (!schoolsEnabled) {
        setSchools([]);
        setActiveSchools([]);
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('schools')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        console.error('Error fetching schools:', fetchError);
        return;
      }

      setSchools(data || []);
      setActiveSchools(data?.filter(school => !school.is_archived) || []);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error in fetchSchools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new school
  const createSchool = async (data: CreateSchoolData): Promise<boolean> => {
    try {
      const result = await createSchoolAction(data);
      
      if (result.success && result.data) {
        // Add to local state
        setSchools(prev => [result.data!, ...prev]);
        setActiveSchools(prev => [result.data!, ...prev]);
        
        return true;
      } else {
        setError(result.error || 'Failed to create school');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };

  // Update an existing school
  const updateSchool = async (id: string, data: UpdateSchoolData): Promise<boolean> => {
    try {
      const result = await updateSchoolAction(id, data);
      
      if (result.success && result.data) {
        // Update local state
        setSchools(prev => 
          prev.map(school => school.id === id ? result.data! : school)
        );
        setActiveSchools(prev => 
          prev.map(school => school.id === id ? result.data! : school)
            .filter(school => !school.is_archived)
        );
        
        return true;
      } else {
        setError(result.error || 'Failed to update school');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };

  // Delete a school
  const deleteSchool = async (id: string): Promise<boolean> => {
    try {
      const result = await deleteSchoolAction(id);
      
      if (result.success) {
        // Remove from local state
        setSchools(prev => prev.filter(school => school.id !== id));
        setActiveSchools(prev => prev.filter(school => school.id !== id));
        
        return true;
      } else {
        setError(result.error || 'Failed to delete school');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };

  // Archive a school (soft delete)
  const archiveSchool = async (id: string): Promise<boolean> => {
    try {
      const result = await archiveSchoolAction(id);
      
      if (result.success) {
        // Update local state
        setSchools(prev => 
          prev.map(school => 
            school.id === id ? { ...school, is_archived: true } : school
          )
        );
        setActiveSchools(prev => prev.filter(school => school.id !== id));
        
        return true;
      } else {
        setError(result.error || 'Failed to archive school');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };

  // Unarchive a school
  const unarchiveSchool = async (id: string): Promise<boolean> => {
    try {
      const result = await unarchiveSchoolAction(id);
      
      if (result.success) {
        // Update local state
        setSchools(prev => 
          prev.map(school => 
            school.id === id ? { ...school, is_archived: false } : school
          )
        );
        // Refresh active schools
        await fetchSchools();
        
        return true;
      } else {
        setError(result.error || 'Failed to unarchive school');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };

  // Get school statistics
  const getSchoolStats = async (schoolId: string): Promise<SchoolStats | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: grades, error } = await supabase
        .from('grades')
        .select('grade, subject, semester_id')
        .eq('user_id', user.id)
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error fetching school stats:', error);
        return null;
      }

      if (!grades || grades.length === 0) {
        return {
          total_grades: 0,
          average_grade: 0,
          subject_count: 0,
          subjects: []
        };
      }

      const subjects = Array.from(new Set(grades.map(g => g.subject)));
      const totalGrades = grades.length;
      const averageGrade = grades.reduce((sum, g) => sum + g.grade, 0) / totalGrades;

      // Calculate semester averages if there are semesters
      const semesterAverages: Record<string, number> = {};
      const semesterGrades: Record<string, number[]> = {};
      
      grades.forEach(grade => {
        if (grade.semester_id) {
          if (!semesterGrades[grade.semester_id]) {
            semesterGrades[grade.semester_id] = [];
          }
          semesterGrades[grade.semester_id].push(grade.grade);
        }
      });

      Object.entries(semesterGrades).forEach(([semesterId, gradesList]) => {
        const avg = gradesList.reduce((sum, g) => sum + g, 0) / gradesList.length;
        semesterAverages[semesterId] = parseFloat(avg.toFixed(2));
      });

      return {
        total_grades: totalGrades,
        average_grade: parseFloat(averageGrade.toFixed(2)),
        subject_count: subjects.length,
        subjects,
        semester_averages: Object.keys(semesterAverages).length > 0 ? semesterAverages : undefined
      };
    } catch (err) {
      console.error('Error getting school stats:', err);
      return null;
    }
  };

  // Load schools on mount and when schoolsEnabled changes
  useEffect(() => {
    fetchSchools();
  }, [schoolsEnabled]);

  return {
    schools,
    activeSchools,
    isLoading,
    error,
    schoolsEnabled, // Export the feature flag so components can check it
    createSchool,
    updateSchool,
    deleteSchool,
    archiveSchool,
    unarchiveSchool,
    getSchoolStats,
    refreshSchools: fetchSchools,
    clearError: () => setError(null)
  };
}
