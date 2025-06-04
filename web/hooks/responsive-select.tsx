'use client';

import { ComponentProps } from "react";
import { SelectContent } from "@/components/ui/select";
import { useIsMobile } from "./use-is-mobile";

/**
 * A responsive version of the SelectContent component that positions
 * the dropdown differently on mobile devices to prevent clipping
 */
export function ResponsiveSelectContent(props: ComponentProps<typeof SelectContent>) {
  const isMobile = useIsMobile();
  
  // Filter out any unexpected props
  const { dropdownPosition, ...restProps } = props as any;
  
  return (
    <SelectContent
      position="popper"
      side={isMobile ? "top" : "bottom"}
      align={isMobile ? "center" : "start"}
      sideOffset={4}
      avoidCollisions={true}
      collisionPadding={{ top: 8, right: 8, bottom: 8, left: 8 }}
      className="max-w-[var(--radix-popover-content-available-width)] max-h-[50vh] overflow-y-auto"
      {...restProps}
    />
  );
}
