// Type guard to check if an object is a valid Note
export function isValidNote(note: any): note is { id: string; title: string; content: string; folder_id: string | null; user_id: string; created_at: string; updated_at: string } {
  return note !== null && 
         typeof note === 'object' && 
         'id' in note && 
         typeof note.id === 'string';
}

// Helper function to safely access a note's ID, avoiding TypeScript errors
export function getNoteId(note: any): string | null {
  if (isValidNote(note)) {
    return note.id;
  }
  return null;
}
