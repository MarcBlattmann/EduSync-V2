"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NoteViewerProps {
  content: string;
  className?: string;
}

export function NoteViewer({ content, className }: NoteViewerProps) {
  // Add debugging to check the received content
  console.log("NoteViewer received content:", content);  return (
    <div 
      className={cn(
        "note-viewer prose prose-sm sm:prose max-w-none p-4 rounded-md bg-background overflow-auto whitespace-pre-wrap",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
