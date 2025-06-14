"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Code,
  Link as LinkIcon,
  Unlink,
  Image
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Editor } from '@tiptap/react';

interface NoteToolbarProps {
  editor: Editor | null;
  className?: string;
}

export function NoteToolbar({ editor, className }: NoteToolbarProps) {
  if (!editor) {
    return null;
  }
  
  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    title, 
    children 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    title?: string; 
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        "h-8 w-8 p-0", 
        isActive ? "bg-accent text-accent-foreground" : ""
      )}
    >
      {children}
    </Button>
  );
  
  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-border mx-1" />
  );
  
  return (
    <div className={cn("flex flex-wrap items-center gap-1 p-1 sm:p-2 border-b sticky top-0 bg-background z-10 overflow-x-auto", className)}>
      <div className="flex items-center gap-1">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
          <span className="sr-only">Bold</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
          <span className="sr-only">Italic</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
          <span className="sr-only">Underline</span>
        </ToolbarButton>
      </div>
      
      <ToolbarDivider />
      
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
          <span className="sr-only">Heading 1</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
          <span className="sr-only">Heading 2</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
          <span className="sr-only">Heading 3</span>
        </ToolbarButton>
      </div>
      
      <ToolbarDivider />
      
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
          <span className="sr-only">Bullet List</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
          <span className="sr-only">Numbered List</span>
        </ToolbarButton>
      </div>
      
      <ToolbarDivider />
      
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
          <span className="sr-only">Code</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />          <span className="sr-only">Link</span>
        </ToolbarButton>
        
        {editor.isActive('link') && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
          >
            <Unlink className="h-4 w-4" />
            <span className="sr-only">Unlink</span>
          </ToolbarButton>
        )}
        
        <ToolbarDivider />
        
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter image URL');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}          title="Insert Image"
        >
          <Image className="h-4 w-4" />
          <span className="sr-only">Image</span>
        </ToolbarButton>
      </div>
    </div>
  );
}