export type Note = {
  id: string;
  title: string;
  content: string;
  folder_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// This is a type assertion helper function
export function asNote(obj: any): Note {
  return obj as Note;
}

// This is a type guard function to use in filter operations
export function isNote(obj: any): obj is Note {
  return obj && 
    typeof obj === 'object' &&
    'id' in obj && 
    'title' in obj && 
    'content' in obj;
}
