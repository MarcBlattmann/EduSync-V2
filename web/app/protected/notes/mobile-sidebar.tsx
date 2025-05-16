"use client";

import React from "react";
import { X, Home, Calendar, BookOpen, FileText, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotesMobile } from "./notes-mobile-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./mobile-sidebar.css";

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
      
      {/* Sidebar panel - Notes specific folders only */}      <div 
        className={cn(
          "mobile-sliding-panel smooth-scroll",
          isSidebarOpen ? "open" : "",
          className
        )}
      >
        <div className="p-3 border-b flex items-center">
          <div className="flex items-center gap-2 mr-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="border-r border-border h-4 mr-2"></div>
          <span className="font-medium">{title}</span>
          <Button variant="ghost" size="sm" onClick={closeSidebar} className="h-9 w-9 p-0 ml-auto">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {/* Notes specific content */}        <div className="flex-1 flex flex-col p-2 notes-folders-container">
          <div className="overflow-auto flex-1 pb-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
