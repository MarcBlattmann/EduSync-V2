"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NoteViewerProps {
  content: string;
  className?: string;
}

export function NoteViewer({ content, className }: NoteViewerProps) {
  return (
    <div 
      className={cn(
        "note-viewer prose prose-sm sm:prose-base max-w-none p-4 rounded-md bg-background",
        "prose-headings:mb-4 prose-headings:mt-6 prose-headings:font-semibold prose-headings:text-foreground",
        "prose-p:leading-7 prose-p:mb-4",
        "prose-pre:rounded-md prose-pre:bg-muted prose-pre:p-4",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-img:rounded-md prose-img:mx-auto prose-img:my-6 prose-img:max-h-96",
        "prose-strong:text-foreground prose-em:text-foreground",
        "prose-ul:my-6 prose-ol:my-6 prose-li:my-1",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/20 prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-muted-foreground",
        "prose-hr:my-8 prose-hr:border-border",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
