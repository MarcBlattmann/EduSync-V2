/**
 * Types and interfaces for semester management system
 */

export interface Semester {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSemesterData {
  name: string;
  start_date: string;
  end_date: string;
}

export interface UpdateSemesterData {
  name?: string;
  start_date?: string;
  end_date?: string;
}

export interface SemesterStats {
  total_grades: number;
  average_grade: number;
  subject_count: number;
  subjects: string[];
}

// Enhanced Grade interface with semester support
export interface GradeWithSemester {
  id: string;
  user_id: string;
  subject: string;
  grade: number;
  date: string;
  description?: string;
  semester_id?: string;
  semester?: Semester;
  created_at: string;
}
