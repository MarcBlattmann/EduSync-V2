"use client";

/**
 * Strips HTML tags from content and returns a plain text preview
 * @param htmlContent HTML content to strip
 * @param maxLength Maximum length of the preview
 * @returns Plain text preview
 */
export function stripHtml(htmlContent: string | null, maxLength: number = 150): string {
  if (!htmlContent) return "";
  
  // Create a temporary DOM element to parse the HTML
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  
  // Get the text content
  const textContent = doc.body.textContent || "";
    // Trim and limit the length
  const trimmed = textContent.trim();
  if (trimmed.length <= maxLength) return trimmed;
  
  return trimmed.substring(0, maxLength) + "...";
}
