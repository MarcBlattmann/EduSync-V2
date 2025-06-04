import { useState, useEffect } from 'react';

/**
 * Hook to determine if a component should use mobile optimizations
 * @param breakpoint - The breakpoint width in pixels (default is 640px for small screens)
 * @returns Boolean indicating if the screen is at or below the breakpoint
 */
export function useIsMobile(breakpoint = 640) {
  // Initialize with a default state that won't cause hydration mismatches
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Set initial value once mounted
    const checkIfMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= breakpoint);
      }
    };
    
    // Check initially
    checkIfMobile();
    
    // Add resize listener
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkIfMobile);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', checkIfMobile);
      };
    }
  }, [breakpoint]);
  
  return isMobile;
}
