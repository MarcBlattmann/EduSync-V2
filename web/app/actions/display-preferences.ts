'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

type DisplayLabelPreference = 'averageGrade' | 'gpa';

/**
 * Server action to save display label preference to Supabase user metadata
 * 
 * @param preference The display preference to save ('averageGrade' | 'gpa')
 * @returns Object with success status and any error message
 */
export async function saveDisplayLabelToSupabase(preference: DisplayLabelPreference): Promise<{ 
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
    
    // Update the user metadata with the display preference
    const { error } = await supabase.auth.updateUser({
      data: {
        ...currentMetadata,
        display_label: preference
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
    console.error('Error saving display preference:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
