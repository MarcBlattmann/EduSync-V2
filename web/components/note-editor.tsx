"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';

interface NoteEditorProps {
  content: string;
  onChange: (value: string) => void;
  className?: string;
  onEditorReady?: (editor: any) => void;
}

export function NoteEditor({ content, onChange, className, onEditorReady }: NoteEditorProps) {
  // Add debugging to check the received content
  console.log("NoteEditor received content:", content);  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: false,
        },
        paragraph: {
          HTMLAttributes: {
            class: 'my-1',
          },
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary underline-offset-2',
        },
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
    ],    content,    onUpdate: ({ editor }) => {
      // Get the full HTML content and log it for debugging
      const html = editor.getHTML();
      console.log("Editor updated, HTML content:", html);
      onChange(html);
    },    editorProps: {
      attributes: {
        class: 'focus:outline-none prose prose-sm sm:prose max-w-none p-4 h-full min-h-[200px] overflow-auto',
      },
    },
  });

  // Share editor instance with parent component
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log("Updating editor content:", content);
      // Ensure proper HTML parsing by using setContent with specific options
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);
  return (
    <div className={cn(
      "note-editor flex flex-col border rounded-md overflow-hidden shadow-sm bg-background",
      "focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20",
      className
    )}>
      <EditorContent editor={editor} className="flex-1 mobile-editor-content" />
    </div>
  );
}
