'use server';

import { createClient } from '@/utils/supabase/server';
import type { CreateSemesterData, UpdateSemesterData, Semester } from '@/types/semester';

/**
 * Server action to create a new semester
 */
export async function createSemester(data: CreateSemesterData): Promise<{
  success: boolean;
  data?: Semester;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: userError ? userError.message : 'User not authenticated'
      };
    }

    // Validate dates
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    
    if (startDate >= endDate) {
      return {
        success: false,
        error: 'Start date must be before end date'
      };
    }    // Create the semester
    const { data: semester, error } = await supabase
      .from('semesters')
      .insert({
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: semester
    };
  } catch (error) {
    console.error('Error creating semester:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server action to update an existing semester
 */
export async function updateSemester(id: string, data: UpdateSemesterData): Promise<{
  success: boolean;
  data?: Semester;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: userError ? userError.message : 'User not authenticated'
      };
    }

    // Validate dates if provided
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (startDate >= endDate) {
        return {
          success: false,
          error: 'Start date must be before end date'
        };
      }
    }

    // Update the semester
    const { data: semester, error } = await supabase
      .from('semesters')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this semester
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: semester
    };
  } catch (error) {
    console.error('Error updating semester:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server action to delete a semester
 */
export async function deleteSemester(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: userError ? userError.message : 'User not authenticated'
      };
    }

    // Delete the semester
    const { error } = await supabase
      .from('semesters')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns this semester

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting semester:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server action to set a semester as active
 */
export async function setActiveSemester(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: userError ? userError.message : 'User not authenticated'
      };
    }

    // Set this semester as active (trigger will handle deactivating others)
    const { error } = await supabase
      .from('semesters')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error setting active semester:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
