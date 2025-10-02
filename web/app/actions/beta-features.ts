'use server';

import { createClient } from '@/utils/supabase/server';

export interface BetaFeatures {
  schoolsEnabled: boolean;
}

/**
 * Save beta features to Supabase user metadata
 * 
 * @param features - The beta features object to save
 * @returns Promise<boolean> - Whether the save was successful
 */
export async function saveBetaFeaturesToSupabase(features: BetaFeatures): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return false;
    }
    
    // Update the user metadata with beta features
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        beta_features: features
      }
    });
    
    if (updateError) {
      console.error('Error updating beta features in Supabase:', updateError);
      return false;
    }
    
    console.log('Successfully saved beta features to Supabase:', features);
    return true;
  } catch (error) {
    console.error('Error in saveBetaFeaturesToSupabase:', error);
    return false;
  }
}
