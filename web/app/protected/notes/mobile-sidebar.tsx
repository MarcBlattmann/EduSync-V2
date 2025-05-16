"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotesMobile } from "./notes-mobile-context";

interface MobileSidebarProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function MobileSidebar({ children, title = "Folders", className }: MobileSidebarProps) {
  const { isMobile, isSidebarOpen, closeSidebar } = useNotesMobile();

  if (!isMobile) return null;

  return (
    <>
      {/* Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar panel */}
      <div 
        className={cn(
          "mobile-sliding-panel smooth-scroll",
          isSidebarOpen ? "open" : "",
          className
        )}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <Button variant="ghost" size="sm" onClick={closeSidebar} className="h-9 w-9 p-0">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="p-3 overflow-auto h-[calc(100%-4rem)]">
          {children}
        </div>
      </div>
    </>
  );
}
