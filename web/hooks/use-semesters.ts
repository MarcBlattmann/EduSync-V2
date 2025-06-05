/**
 * React hook for managing semesters
 * Provides CRUD operations and state management for semesters
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Semester, CreateSemesterData, UpdateSemesterData, SemesterStats } from '@/types/semester';
import { 
  createSemester as createSemesterAction,
  updateSemester as updateSemesterAction,
  deleteSemester as deleteSemesterAction
} from '@/app/actions/semester';

export function useSemesters() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemester, setActiveSemesterState] = useState<Semester | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  // Fetch all semesters for the current user
  const fetchSemesters = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        console.error('Error fetching semesters:', fetchError);
        return;
      }

      setSemesters(data || []);
      
      // Automatically determine active semester based on current date
      const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
      const currentActiveSemester = data?.find(semester => {
        const startDate = new Date(semester.start_date);
        const endDate = new Date(semester.end_date);
        const todayDate = new Date(today);
        return todayDate >= startDate && todayDate <= endDate;
      }) || null;
      
      setActiveSemesterState(currentActiveSemester);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error in fetchSemesters:', err);
    } finally {
      setIsLoading(false);
    }
  };  // Create a new semester
  const createSemester = async (data: CreateSemesterData): Promise<boolean> => {
    try {
      const result = await createSemesterAction(data);
      
      if (result.success && result.data) {
        // Add to local state
        setSemesters(prev => {
          const newSemesters = [result.data!, ...prev];
          // Recalculate active semester
          const today = new Date().toISOString().split('T')[0];
          const currentActiveSemester = newSemesters.find(semester => {
            const startDate = new Date(semester.start_date);
            const endDate = new Date(semester.end_date);
            const todayDate = new Date(today);
            return todayDate >= startDate && todayDate <= endDate;
          }) || null;
          setActiveSemesterState(currentActiveSemester);
          return newSemesters;
        });
        
        return true;
      } else {
        setError(result.error || 'Failed to create semester');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };
  // Update an existing semester
  const updateSemester = async (id: string, data: UpdateSemesterData): Promise<boolean> => {
    try {
      const result = await updateSemesterAction(id, data);
      
      if (result.success && result.data) {
        // Update local state
        setSemesters(prev => {
          const updatedSemesters = prev.map(semester =>
            semester.id === id ? result.data! : semester
          );
          // Recalculate active semester
          const today = new Date().toISOString().split('T')[0];
          const currentActiveSemester = updatedSemesters.find(semester => {
            const startDate = new Date(semester.start_date);
            const endDate = new Date(semester.end_date);
            const todayDate = new Date(today);
            return todayDate >= startDate && todayDate <= endDate;
          }) || null;
          setActiveSemesterState(currentActiveSemester);
          return updatedSemesters;
        });
        
        return true;
      } else {
        setError(result.error || 'Failed to update semester');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };  // Delete a semester
  const deleteSemester = async (id: string): Promise<boolean> => {
    try {
      const result = await deleteSemesterAction(id);
      
      if (result.success) {
        // Remove from local state
        setSemesters(prev => {
          const filteredSemesters = prev.filter(semester => semester.id !== id);
          // Recalculate active semester
          const today = new Date().toISOString().split('T')[0];
          const currentActiveSemester = filteredSemesters.find(semester => {
            const startDate = new Date(semester.start_date);
            const endDate = new Date(semester.end_date);
            const todayDate = new Date(today);
            return todayDate >= startDate && todayDate <= endDate;
          }) || null;
          setActiveSemesterState(currentActiveSemester);
          return filteredSemesters;
        });
        
        return true;
      } else {
        setError(result.error || 'Failed to delete semester');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };

  // Get semester statistics
  const getSemesterStats = async (semesterId: string): Promise<SemesterStats | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: grades, error } = await supabase
        .from('grades')
        .select('grade, subject')
        .eq('user_id', user.id)
        .eq('semester_id', semesterId);

      if (error) {
        console.error('Error fetching semester stats:', error);
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

      return {
        total_grades: totalGrades,
        average_grade: averageGrade,
        subject_count: subjects.length,
        subjects
      };
    } catch (err) {
      console.error('Error getting semester stats:', err);
      return null;
    }
  };

  // Load semesters on mount
  useEffect(() => {
    fetchSemesters();
  }, []);
  return {
    semesters,
    activeSemester,
    isLoading,
    error,
    createSemester,
    updateSemester,
    deleteSemester,
    getSemesterStats,
    refreshSemesters: fetchSemesters,
    clearError: () => setError(null)
  };
}
