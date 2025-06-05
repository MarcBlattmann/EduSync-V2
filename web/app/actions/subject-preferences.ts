'use server';

import { createClient } from '@/utils/supabase/server';

type SubjectFilterPreference = 'all' | 'active-semester';

/**
 * Server action to save subject filter preference to Supabase user metadata
 * 
 * @param preference The subject filter preference to save ('all' | 'active-semester')
 * @returns Object with success status and any error message
 */
export async function saveSubjectFilterToSupabase(preference: SubjectFilterPreference): Promise<{ 
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
    
    // Update the user metadata with the subject filter preference
    const { error } = await supabase.auth.updateUser({
      data: {
        ...currentMetadata,
        subject_filter: preference
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
    console.error('Error saving subject filter preference:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
