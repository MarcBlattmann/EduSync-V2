/**
 * Types and interfaces for school management system
 */

export interface School {
  id: string;
  name: string;
  color: string;
  subjects?: string[];
  is_archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolData {
  name: string;
  color?: string;
  subjects?: string[];
}

export interface UpdateSchoolData {
  name?: string;
  color?: string;
  subjects?: string[];
  is_archived?: boolean;
}

export interface SchoolStats {
  total_grades: number;
  average_grade: number;
  subject_count: number;
  subjects: string[];
  semester_averages?: Record<string, number>;
}

// Enhanced Grade interface with school support
export interface GradeWithSchool {
  id: string;
  user_id: string;
  subject: string;
  grade: number;
  date: string;
  description?: string;
  semester_id?: string;
  school_id?: string;
  school?: School;
  created_at: string;
}
