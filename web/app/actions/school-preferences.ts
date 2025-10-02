'use server';

import { createClient } from '@/utils/supabase/server';

type SchoolFilterPreference = 'all' | 'specific-school' | 'no-school';

/**
 * Server action to save school filter preference to Supabase user metadata
 * 
 * @param preference The school filter preference to save ('all' | 'specific-school' | 'no-school')
 * @returns Object with success status and any error message
 */
export async function saveSchoolFilterToSupabase(preference: SchoolFilterPreference): Promise<{ 
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
    
    // Update the user metadata with the school filter preference
    const { error } = await supabase.auth.updateUser({
      data: {
        ...currentMetadata,
        school_filter: preference
      }
    });
    
    if (error) {
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
    return {
      success: false,
      error: errorMessage
    };
  }
}
