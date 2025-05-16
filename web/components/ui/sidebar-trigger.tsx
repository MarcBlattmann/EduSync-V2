"use client";

import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarTriggerProps {
  className?: string;
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  return (
    <Button 
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 p-0",
        className
      )}
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
}
