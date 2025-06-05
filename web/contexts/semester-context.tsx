'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSemesters as useOriginalSemesters } from '@/hooks/use-semesters';
import type { Semester, CreateSemesterData, UpdateSemesterData, SemesterStats } from '@/types/semester';

interface SemesterContextType {
  semesters: Semester[];
  activeSemester: Semester | null;
  isLoading: boolean;
  error: string | null;
  createSemester: (data: CreateSemesterData) => Promise<boolean>;
  updateSemester: (id: string, data: UpdateSemesterData) => Promise<boolean>;
  deleteSemester: (id: string) => Promise<boolean>;
  getSemesterStats: (semesterId: string) => Promise<SemesterStats | null>;
  refreshSemesters: () => Promise<void>;
  clearError: () => void;
}

const SemesterContext = createContext<SemesterContextType | undefined>(undefined);

interface SemesterProviderProps {
  children: ReactNode;
}

export function SemesterProvider({ children }: SemesterProviderProps) {
  const semesterData = useOriginalSemesters();

  // Debug logging
  console.log('SemesterProvider - Current semesters:', semesterData.semesters.length);

  return (
    <SemesterContext.Provider value={semesterData}>
      {children}
    </SemesterContext.Provider>
  );
}

export function useSemesters() {
  const context = useContext(SemesterContext);
  if (context === undefined) {
    throw new Error('useSemesters must be used within a SemesterProvider');
  }
  
  // Debug logging
  console.log('useSemesters - Context used, semesters count:', context.semesters.length);
  
  return context;
}
