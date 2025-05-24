'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

type GradeSystem = '6best' | '1best' | 'american' | 'gpa' | 'percentage' | 'ib';

/**
 * Server action to save grade system preference to Supabase user metadata
 * 
 * @param system The grade system to save ('6best', '1best', 'american', 'gpa', 'percentage', 'ib')
 * @returns Object with success status and any error message
 */
export async function saveGradeSystemToSupabase(system: GradeSystem): Promise<{ 
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
    
    // Update the user metadata with the grade system preference
    const { error } = await supabase.auth.updateUser({
      data: {
        ...currentMetadata,
        grade_system: system
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
    console.error('Error saving grade system:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
