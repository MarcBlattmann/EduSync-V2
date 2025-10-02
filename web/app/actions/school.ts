'use server';

import { createClient } from '@/utils/supabase/server';
import type { CreateSchoolData, UpdateSchoolData, School } from '@/types/school';

/**
 * Server action to create a new school
 */
export async function createSchool(data: CreateSchoolData): Promise<{
  success: boolean;
  data?: School;
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

    // Create the school
    const { data: school, error } = await supabase
      .from('schools')
      .insert({
        name: data.name,
        color: data.color || '#3b82f6',
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: school
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in createSchool:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Server action to update an existing school
 */
export async function updateSchool(id: string, data: UpdateSchoolData): Promise<{
  success: boolean;
  data?: School;
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

    // Update the school
    const { data: school, error } = await supabase
      .from('schools')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating school:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: school
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in updateSchool:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Server action to delete a school
 */
export async function deleteSchool(id: string): Promise<{
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

    // Delete the school
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting school:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in deleteSchool:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Server action to archive a school (soft delete)
 */
export async function archiveSchool(id: string): Promise<{
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

    // Archive the school
    const { error } = await supabase
      .from('schools')
      .update({ is_archived: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error archiving school:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in archiveSchool:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Server action to unarchive a school
 */
export async function unarchiveSchool(id: string): Promise<{
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

    // Unarchive the school
    const { error } = await supabase
      .from('schools')
      .update({ is_archived: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error unarchiving school:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in unarchiveSchool:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}
