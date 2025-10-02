'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface BetaFeatures {
  schoolsEnabled: boolean;
}

const DEFAULT_BETA_FEATURES: BetaFeatures = {
  schoolsEnabled: false,
};

/**
 * React hook that manages beta feature flags and syncs between localStorage and Supabase
 * 
 * @returns {Object} The beta features state, setters, and loading state
 */
export function useBetaFeatures() {
  // Initialize with default or localStorage value
  const [betaFeatures, setBetaFeaturesState] = useState<BetaFeatures>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('betaFeatures');
      if (stored) {
        try {
          return { ...DEFAULT_BETA_FEATURES, ...JSON.parse(stored) };
        } catch {
          return DEFAULT_BETA_FEATURES;
        }
      }
    }
    return DEFAULT_BETA_FEATURES;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase on component mount
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.beta_features) {
          const featuresFromSupabase = user.user_metadata.beta_features as BetaFeatures;
          
          // Merge with defaults to ensure all features are present
          const mergedFeatures = { ...DEFAULT_BETA_FEATURES, ...featuresFromSupabase };
          
          // Update state and localStorage
          setBetaFeaturesState(mergedFeatures);
          localStorage.setItem('betaFeatures', JSON.stringify(mergedFeatures));
        }
      } catch (error) {
        console.error('Error fetching beta features from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFromSupabase();
    
    // Listen for changes from other components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'betaFeatures' && event.newValue) {
        try {
          const newFeatures = JSON.parse(event.newValue) as BetaFeatures;
          setBetaFeaturesState(newFeatures);
        } catch (error) {
          console.error('Error parsing beta features from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to update beta features
  const setBetaFeatures = async (newFeatures: Partial<BetaFeatures>) => {
    const updatedFeatures = { ...betaFeatures, ...newFeatures };
    
    // Update localStorage first for immediate UI update
    localStorage.setItem('betaFeatures', JSON.stringify(updatedFeatures));
    setBetaFeaturesState(updatedFeatures);
    
    try {
      // Then update Supabase
      const { saveBetaFeaturesToSupabase } = await import('@/app/actions/beta-features');
      await saveBetaFeaturesToSupabase(updatedFeatures);
      
      // Notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'betaFeatures',
        newValue: JSON.stringify(updatedFeatures)
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving beta features:', error);
      return false;
    }
  };

  // Convenience function to toggle a single feature
  const toggleFeature = async (feature: keyof BetaFeatures) => {
    return setBetaFeatures({ [feature]: !betaFeatures[feature] });
  };

  return {
    betaFeatures,
    setBetaFeatures,
    toggleFeature,
    isLoading,
    // Individual feature accessors for convenience
    schoolsEnabled: betaFeatures.schoolsEnabled,
  };
}
