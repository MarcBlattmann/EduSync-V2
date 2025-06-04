import { useMemo } from 'react';

/**
 * Customize the dropdown content position and alignment based on screen size.
 * On mobile screens, positions the dropdown above the trigger to avoid clipping out of view.
 * 
 * @param isMobile Boolean indicating if the current screen is a mobile screen
 * @returns Object containing position settings for the dropdown
 */
export function useDropdownPosition(isMobile: boolean) {
  return useMemo(() => ({
    // On mobile, position above to prevent clipping at bottom
    side: isMobile ? "top" : "bottom" as "top" | "bottom",
    // On mobile, center the dropdown for better visibility
    align: isMobile ? "center" : "start" as "center" | "start",
    // Add collision padding to prevent dropdown from going off screen
    collisionPadding: { top: 10, right: 10, bottom: 10, left: 10 },
    // Always try to avoid collisions
    avoidCollisions: true,
    // Class to handle overflow and max height
    className: "max-w-[var(--radix-popover-content-available-width)] max-h-[50vh] overflow-y-auto"
  }), [isMobile]);
}
