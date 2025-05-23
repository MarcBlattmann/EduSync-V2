"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { NoteViewer } from "@/components/note-viewer";
import { useParams } from "next/navigation";
import Link from "next/link";

interface NoteShare {
  id: string;
  user_id: string;
  note_id: string;
  share_code: string;
  name: string;
  expires_at: string | null;
  created_at: string;
  active: boolean;
  owner_name: string;
}

interface SharedNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function SharedNotePage() {
  const params = useParams();
  const shareCode = params.code as string;
  
  const [note, setNote] = useState<SharedNote | null>(null);
  const [shareData, setShareData] = useState<NoteShare | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/note-share/${shareCode}`);
        const data = await response.json();
        
        if (!response.ok) {
          // Set error message without throwing an exception
          if (response.status === 404) {
            setError("This shared note is no longer available. It may have been deleted by its owner.");
          } else if (response.status === 403) {
            setError("This shared note link has expired.");
          } else {
            setError(data.error || "Failed to load shared note");
          }
          return;
        }
        
        setNote(data.note || null);
        setShareData(data.share || null);
      } catch (err: any) {
        // Only log technical errors, not our user-friendly ones
        if (err.message !== "Failed to fetch") {
          console.error("Error loading shared note:", err);
        }
        setError("Unable to connect to the server. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (shareCode) {
      fetchSharedNote();
    }
  }, [shareCode]);
  
  // Format Date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container py-6 max-w-screen-lg">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/notes">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to My Notes
            </Link>
          </Button>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6 max-w-screen-lg">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/notes">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to My Notes
            </Link>
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="mt-4 text-center">
          <p className="text-muted-foreground">
            You might need a new share link. Please contact the note owner.
          </p>
        </div>
      </div>
    );
  }

  if (!note || !shareData) {
    return (
      <div className="container py-6 max-w-screen-lg">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/notes">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to My Notes
            </Link>
          </Button>
        </div>
        
        <Alert>
          <AlertTitle>Note Not Found</AlertTitle>
          <AlertDescription>This note is no longer available or may have been deleted.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-screen-lg">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/protected/notes">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to My Notes
          </Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
        <p className="text-sm text-muted-foreground">
          Shared by {shareData.owner_name} • Last updated {formatDate(note.updated_at)}
        </p>
      </div>
      
      <Separator className="my-4" />
      
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <NoteViewer content={note.content} />
      </div>
    </div>
  );
}
