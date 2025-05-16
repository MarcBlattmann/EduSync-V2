"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type NotesMobileContextType = {
  isMobile: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
};

const NotesMobileContext = createContext<NotesMobileContextType | undefined>(undefined);

export function NotesMobileProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on window resize transition from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <NotesMobileContext.Provider
      value={{ isMobile, isSidebarOpen, toggleSidebar, openSidebar, closeSidebar }}
    >
      {children}
    </NotesMobileContext.Provider>
  );
}

export function useNotesMobile(): NotesMobileContextType {
  const context = useContext(NotesMobileContext);
  if (context === undefined) {
    throw new Error("useNotesMobile must be used within a NotesMobileProvider");
  }
  return context;
}
