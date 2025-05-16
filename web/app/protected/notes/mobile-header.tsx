"use client";

import React from "react";
import { Menu, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotesMobile } from "./notes-mobile-context";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function MobileHeader({ title, showBackButton = false, onBackClick }: MobileHeaderProps) {
  const { isMobile, toggleSidebar } = useNotesMobile();

  if (!isMobile) return null;

  return (
    <div className="md:hidden sticky top-0 z-10 flex items-center justify-between p-3 border-b bg-background/80 backdrop-blur-sm">
      {showBackButton ? (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackClick} 
          className="h-9 w-9 p-0 hover:bg-accent/50 active:bg-accent"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar} 
          className="h-9 w-9 p-0 hover:bg-accent/50 active:bg-accent"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      )}
      <h2 className={cn(
        "font-medium truncate max-w-[200px] transition-all",
        showBackButton ? "text-base" : "text-lg"
      )}>
        {title}
      </h2>
      <div className="w-9"></div> {/* Spacer for alignment */}
    </div>
  );
}
