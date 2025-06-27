"use client";

import React from "react";
import { Menu, ChevronLeft, PanelLeft, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotesMobile } from "./notes-mobile-context";
import { SidebarTrigger } from "@/components/ui/sidebar-trigger";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  actionButtons?: React.ReactNode;
}

export function MobileHeader({ title, showBackButton = false, onBackClick, actionButtons }: MobileHeaderProps) {
  const { isMobile, toggleSidebar } = useNotesMobile();
  
  // We need to import useSidebar to control the main app sidebar
  const { toggleSidebar: toggleAppSidebar } = useSidebar();
  
  if (!isMobile) return null;
  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center p-3 border-b bg-background/95 backdrop-blur-sm notes-mobile-header">
      {showBackButton ? (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackClick} 
          className="h-9 w-9 p-0 mr-2 hover:bg-accent/50 active:bg-accent"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      ) : (
        <div className="sidebar-buttons-container flex items-center gap-1 mr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleAppSidebar}
                  className="h-8 w-8 p-0 hover:bg-accent/50 active:bg-accent relative app-sidebar-button"
                >
                  <PanelLeft className="h-4 w-4" />
                  <span className="sr-only">Navigation</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">App Navigation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleSidebar} 
                  className="h-8 w-8 p-0 hover:bg-accent/50 active:bg-accent relative notes-sidebar-button"
                >
                  <FolderTree className="h-4 w-4" />
                  <span className="sr-only">Note Folders</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Note Folders</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
        <div className="flex items-center">
        {!showBackButton && <div className="mr-4 h-4 border-r border-border"></div>}
        <h2 className={cn(
          "font-medium truncate transition-all",
          showBackButton ? "text-base" : "text-lg"
        )}>
          {title}
        </h2>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        {actionButtons}
      </div>
    </div>
  );
}
