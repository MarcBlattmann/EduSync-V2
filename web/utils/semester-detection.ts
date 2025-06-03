/**
 * Utility functions for automatic semester detection based on entry dates
 */

import type { Semester } from '@/types/semester';

/**
 * Determines which semester a given date falls into
 * @param entryDate - The date of the entry (in YYYY-MM-DD format)
 * @param semesters - Array of available semesters
 * @returns The semester that contains the entry date, or null if no match
 */
export function detectSemesterFromDate(entryDate: string, semesters: Semester[]): Semester | null {
  if (!entryDate || !semesters || semesters.length === 0) {
    return null;
  }

  // Convert entry date to Date object for comparison
  const entryDateObj = new Date(entryDate);
  
  // Find semester that contains this date
  for (const semester of semesters) {
    const startDate = new Date(semester.start_date);
    const endDate = new Date(semester.end_date);
    
    // Check if entry date falls within semester range (inclusive)
    if (entryDateObj >= startDate && entryDateObj <= endDate) {
      return semester;
    }
  }
  
  return null;
}

/**
 * Gets the semester ID for a given date, with fallback to active semester
 * @param entryDate - The date of the entry
 * @param semesters - Array of available semesters
 * @param activeSemester - The currently active semester (fallback)
 * @returns Semester ID or empty string if no match
 */
export function getSemesterIdFromDate(
  entryDate: string, 
  semesters: Semester[], 
  activeSemester: Semester | null
): string {
  const detectedSemester = detectSemesterFromDate(entryDate, semesters);
  
  if (detectedSemester) {
    return detectedSemester.id;
  }
  
  // Fallback to active semester if no date-based match
  return activeSemester?.id || '';
}

/**
 * Checks if a date falls within any semester range
 * @param entryDate - The date to check
 * @param semesters - Array of available semesters
 * @returns true if date falls within any semester, false otherwise
 */
export function isDateWithinAnySemester(entryDate: string, semesters: Semester[]): boolean {
  return detectSemesterFromDate(entryDate, semesters) !== null;
}

/**
 * Gets a human-readable description of semester detection result
 * @param entryDate - The date of the entry
 * @param semesters - Array of available semesters
 * @param activeSemester - The currently active semester
 * @returns Description of which semester was detected or why detection failed
 */
export function getSemesterDetectionInfo(
  entryDate: string, 
  semesters: Semester[], 
  activeSemester: Semester | null
): string {
  const detectedSemester = detectSemesterFromDate(entryDate, semesters);
  
  if (detectedSemester) {
    return `Automatically assigned to "${detectedSemester.name}" semester`;
  }
  
  if (activeSemester) {
    return `Date doesn't match any semester range, using active semester "${activeSemester.name}"`;
  }
  
  return 'No semester could be determined for this date';
}
