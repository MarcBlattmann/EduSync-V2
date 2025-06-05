'use server';

import { createClient } from '@/utils/supabase/server';

type SemesterDefaultPreference = 'all' | 'active' | string; // string for specific semester ID

/**
 * Server action to save semester default preference to Supabase user metadata
 * 
 * @param preference The semester default preference to save ('all' | 'active' | specific semester ID)
 * @returns Object with success status and any error message
 */
export async function saveSemesterDefaultToSupabase(preference: SemesterDefaultPreference): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: userError ? userError.message : 'User not authenticated'
      };
    }
    
    // Get current metadata to preserve other values
    const currentMetadata = user.user_metadata || {};
    
    // Update the user metadata with the semester default preference
    const { error } = await supabase.auth.updateUser({
      data: {
        ...currentMetadata,
        default_semester: preference
      }
    });
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving semester default preference:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
