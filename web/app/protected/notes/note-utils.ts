"use client";
import React from 'react';
import { Note } from "./types";

// Type guard function to check if an object is a Note
export function isNote(obj: any): obj is Note {
  return (
    obj && 
    typeof obj === 'object' && 
    'id' in obj && 
    'title' in obj && 
    'content' in obj
  );
}

// Cast function to safely cast an object to a Note
export function asNote(obj: any): Note {
  if (!isNote(obj)) {
    console.warn("Object is not a valid Note:", obj);
    // Return a minimal valid Note to avoid runtime errors
    return {
      id: "unknown",
      title: "Unknown Note",
      content: "",
      folder_id: null,
      user_id: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  return obj as Note;
}

// Function to safely map over notes array with proper typing
export function mapNotes(notes: any[], mapper: (note: Note) => JSX.Element): JSX.Element[] {
  return notes
    .map(note => asNote(note))
    .map(mapper);
}
