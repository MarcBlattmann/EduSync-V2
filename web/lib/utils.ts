import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the number of days remaining until a given date
 * @param targetDate - The target date (as string or Date)
 * @returns Number of days remaining (0 if today, negative if past)
 */
export function getDaysRemaining(targetDate: string | Date): number {
  const today = new Date();
  const target = new Date(targetDate);
  
  // Reset time to start of day for accurate day calculation
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format days remaining into a human-readable string
 * @param days - Number of days remaining
 * @returns Formatted string like "5 days left", "Today", "1 day left"
 */
export function formatDaysRemaining(days: number): string {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}
