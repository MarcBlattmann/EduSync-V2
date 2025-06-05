import { useState, useEffect } from 'react';

/**
 * Responsive hook that shows dropdown on the right when there's space,
 * otherwise falls back to vertical layout underneath the text
 */
export function useSemesterSelectorWidth() {
  const [isSmallScreen, setIsSmallScreen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      // Use a reasonable breakpoint for horizontal vs vertical layout
      // 768px is typically tablet/desktop size where we have enough space
      const hasEnoughSpace = window.innerWidth >= 768;
      setIsSmallScreen(!hasEnoughSpace);
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return {
    isSmallScreen,
    triggerStyle: isSmallScreen ? {
      width: '100%',
      maxWidth: '100%'
    } : {
      width: '100%',
      minWidth: '100%'
    },
    containerClasses: isSmallScreen ? 'w-full' : 'flex-shrink-0',
    triggerClasses: isSmallScreen ? 'w-full' : 'w-auto'
  };
}
