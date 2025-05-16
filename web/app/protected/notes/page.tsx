"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar-trigger";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  FolderPlus,
  File, 
  FileText, 
  Folder,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Search,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stripHtml } from "@/lib/notes-utils";
import { NoteEditor } from "@/components/note-editor";
import { NoteViewer } from "@/components/note-viewer";
import { NoteToolbar } from "@/components/note-toolbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotesMobileProvider, useNotesMobile } from "./notes-mobile-context";
import { MobileSidebar } from "./mobile-sidebar";
import { MobileHeader } from "./mobile-header";
import "./notes.css";
import { getNoteId, isValidNote } from "./note-type-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the structure for notes and folders
interface Note {
  id: string;
  title: string;
  content: string;
  folder_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
}

// Simple function to strip HTML and limit text length
function stripText(text: string | null, maxLength: number = 150): string {
  if (!text) return "";
  const plain = stripHtml(text).replace(/\s{2,}/g, ' ').trim();
  if (plain.length <= maxLength) return plain;
  return plain.substring(0, maxLength) + "...";
}

function NotesContent() {
  const { isMobile, openSidebar, closeSidebar } = useNotesMobile();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [createNoteDialogOpen, setCreateNoteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'note' | 'folder', id: string } | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showFolderAlert, setShowFolderAlert] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [editorInstance, setEditorInstance] = useState<any>(null);
  
  const supabase = createClient();

  // Fetch folders and notes
  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Fetch folders
      const { data: folderData, error: folderError } = await supabase
        .from('note_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (folderError) {
        console.error('Error fetching folders:', folderError);
      } else {
        setFolders(folderData || []);
      }
      
      // Fetch notes
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (noteError) {
        console.error('Error fetching notes:', noteError);
      } else {
        setNotes(noteData || []);
      }
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle folder expansion
  const toggleFolderExpand = (folderId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent folder selection when toggling
    }
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('note_folders')
      .insert([
        {
          name: newFolderName,
          parent_id: selectedFolder,
          user_id: user.id
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating folder:', error);
    } else {
      // Add new folder to state and reset form
      setFolders([...folders, data![0]]);
      setNewFolderName('');
      setCreateFolderDialogOpen(false);
      
      // Expand the parent folder if it exists
      if (selectedFolder) {
        setExpandedFolders(prev => ({
          ...prev,
          [selectedFolder]: true
        }));
      }
    }
  };

  // Create new note
  const handleCreateNote = async () => {
    if (!newNoteName.trim()) return;
    if (!selectedFolder) {
      setShowFolderAlert(true);
      setTimeout(() => setShowFolderAlert(false), 3000);
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
      const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          title: newNoteName,
          // Start with a properly structured HTML document to ensure formatting works
          content: `<h1>${newNoteName}</h1><p>Start writing your note here...</p>`,
          folder_id: selectedFolder,
          user_id: user.id
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating note:', error);    } else {
      // Add new note to state and reset form
      const newNote = data![0] as Note;
      console.log("Created new note with content:", newNote.content);
      
      // Ensure the note list is updated with the new note
      setNotes([newNote, ...notes]);
      setNewNoteName('');
      setCreateNoteDialogOpen(false);
      
      // Expand the folder where the note was created
      if (selectedFolder) {
        setExpandedFolders(prev => ({
          ...prev,
          [selectedFolder]: true
        }));
      }
      
      // Select the new note
      setSelectedNote(newNote);
      setNoteContent(newNote.content);
      setEditMode(true);
    }
  };

  // Delete note or folder
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'note') {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', itemToDelete.id);
      
      if (error) {
        console.error('Error deleting note:', error);
      } else {
        // Remove note from state
        setNotes(notes.filter(note => note.id !== itemToDelete.id));
        
        // If the deleted note was selected, clear selection
        if (selectedNote && selectedNote.id === itemToDelete.id) {
          setSelectedNote(null);
          setNoteContent('');
        }
      }
    } else {
      // First, delete all notes in this folder
      const { error: noteError } = await supabase
        .from('notes')
        .delete()
        .eq('folder_id', itemToDelete.id);
      
      if (noteError) {
        console.error('Error deleting notes in folder:', noteError);
        return;
      }
      
      // Then delete the folder
      const { error: folderError } = await supabase
        .from('note_folders')
        .delete()
        .eq('id', itemToDelete.id);
      
      if (folderError) {
        console.error('Error deleting folder:', folderError);
      } else {
        // Remove folder from state
        setFolders(folders.filter(folder => folder.id !== itemToDelete.id));
        
        // If the deleted folder was selected, clear selection
        if (selectedFolder === itemToDelete.id) {
          setSelectedFolder(null);
        }
        
        // Remove from expanded folders
        const newExpandedFolders = { ...expandedFolders };
        delete newExpandedFolders[itemToDelete.id];
        setExpandedFolders(newExpandedFolders);
      }
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };  // Save note content
  const saveNote = async () => {
    if (!selectedNote) return;
    
    // Log the content being saved for debugging purposes
    console.log("Original note content for saving:", noteContent);
    
    // Ensure the content is properly saved as HTML
    // The TipTap editor generates HTML content which needs to be saved as-is
    const contentToSave = noteContent;
    
    // Log the contentToSave to verify it's the correct HTML
    console.log("Content being saved to database:", contentToSave);
    
    const { error } = await supabase
      .from('notes')
      .update({ content: contentToSave, updated_at: new Date().toISOString() })
      .eq('id', selectedNote.id);
    
    if (error) {
      console.error('Error saving note:', error);
    } else {
      // Update note in state
      const updatedNotes = notes.map(note => 
        note.id === selectedNote.id 
          ? { ...note, content: contentToSave, updated_at: new Date().toISOString() } 
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({ ...selectedNote, content: contentToSave, updated_at: new Date().toISOString() });
      setEditMode(false);
      
      // Log the content after it has been saved
      console.log("Note content after saving:", contentToSave);
    }
  };  // Get filtered notes for the current folder
  // This only shows notes when a folder is selected AND a note is clicked
  const getFilteredNotes = (): Note[] => {
    let filteredNotes: Note[] = notes;
    
    // Only show notes for the currently selected folder, regardless of search query
    if (selectedFolder) {
      return filteredNotes.filter(note => note.folder_id === selectedFolder);
    }
    
    // If no folder is selected, return an empty array
    return [] as Note[];
  };

  // Get search results that match the search query
  const getSearchResults = (): Note[] => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      stripHtml(note.content).toLowerCase().includes(query)
    );
  };

  // Get subfolders for a parent folder
  const getSubfolders = (parentId: string | null) => {
    return folders.filter(folder => folder.parent_id === parentId);
  };

  // Check if a folder has notes matching search query
  const folderHasSearchResults = (folderId: string): boolean => {
    // If no search query, always return true
    if (!searchQuery) return true;
    
    // Check if this folder has any notes matching the search query
    const query = searchQuery.toLowerCase();
    const notesInFolder = notes.filter(note => note.folder_id === folderId);
    
    const hasMatchingNotes = notesInFolder.some(note => 
      note.title.toLowerCase().includes(query) || 
      stripHtml(note.content).toLowerCase().includes(query)
    );
    
    if (hasMatchingNotes) return true;
    
    // Check if any subfolders have matching notes
    const subfolders = folders.filter(folder => folder.parent_id === folderId);
    return subfolders.some(subfolder => folderHasSearchResults(subfolder.id));
  };
  
  // Get notes for a specific folder (filtered by search query if present)
  const getFolderNotes = (folderId: string) => {
    let folderNotes = notes.filter(note => note.folder_id === folderId);
    
    // If there's a search query, only show notes that match the search within this folder
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      folderNotes = folderNotes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        stripHtml(note.content).toLowerCase().includes(query)
      );
    }
    
    return folderNotes;
  };

  // Render folder tree recursively
  const renderFolderTree = (parentId: string | null, level = 0) => {
    const subfolders = getSubfolders(parentId);
    
    if (subfolders.length === 0) {
      return null;
    }
    
    // Filter folders based on search results if search query exists
    const foldersToShow = searchQuery 
      ? subfolders.filter(folder => folderHasSearchResults(folder.id))
      : subfolders;
    
    if (foldersToShow.length === 0) {
      return null;
    }
    
    return (
      <div className={cn(level > 0 ? "ml-4" : "")}>
        {foldersToShow.map(folder => {
          // Get notes for this folder
          const folderNotes = getFolderNotes(folder.id);
          
          return (
            <div key={folder.id}>
              <div 
                className={cn(
                  "flex items-center py-1 px-2 rounded-md cursor-pointer group folder-tree-item",
                  selectedFolder === folder.id ? "active" : ""
                )}
              >
                <button 
                  onClick={(e) => toggleFolderExpand(folder.id, e)}
                  className={cn(
                    "p-1 rounded-sm hover:bg-accent/50 folder-toggle",
                    expandedFolders[folder.id] ? "expanded" : ""
                  )}
                >
                  {expandedFolders[folder.id] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>                <div                  className="flex items-center gap-2 flex-1 p-1 pl-2"
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    // Clear any search query when selecting a folder
                    if (searchQuery) {
                      setSearchQuery('');
                    }
                    // Clear selected note when selecting a folder
                    if (selectedNote) {
                      setSelectedNote(null);
                    }
                    // For mobile, automatically expand the folder when selected
                    if (!expandedFolders[folder.id]) {
                      toggleFolderExpand(folder.id);
                    }
                    // On mobile, close the sidebar after selecting a folder
                    if (isMobile) {
                      closeSidebar();
                    }
                  }}
                >
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className={cn(
                    "text-sm truncate",
                    folderNotes.length > 0 ? "folder-with-content" : "folder-empty"
                  )}>{folder.name}{folderNotes.length > 0 ? ` (${folderNotes.length})` : ''}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedFolder(folder.id);
                        setCreateNoteDialogOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span>New Note</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedFolder(folder.id);
                        setCreateFolderDialogOpen(true);
                      }}
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      <span>New Folder</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setItemToDelete({ type: 'folder', id: folder.id });
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {expandedFolders[folder.id] && (
                <>
                  {/* Display notes within this folder */}
                  {folderNotes.length > 0 && (
                    <div className="ml-4 mt-1">
                      {folderNotes.map(note => (
                        <div 
                          key={note.id}
                          className={cn(
                            "flex items-center py-1 px-2 rounded-md cursor-pointer group note-item",
                            selectedNote?.id === note.id ? "active" : ""
                          )}
                          onClick={() => {
                            setSelectedNote(note);
                            setNoteContent(note.content);
                            setEditMode(false);
                            // On mobile, close the sidebar after selecting a note
                            if (isMobile) {
                              closeSidebar();
                            }
                          }}
                        >
                          <div className="w-6"></div> {/* Spacer for alignment */}
                          <div className="flex items-center gap-2 flex-1 p-1 pl-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{note.title}</span>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNote(note);
                                  setNoteContent(note.content);
                                  setEditMode(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemToDelete({ type: 'note', id: note.id });
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Display subfolders */}
                  {renderFolderTree(folder.id, level + 1)}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // When search query changes, expand folders with search results
  useEffect(() => {
    if (searchQuery) {
      // First, identify all folders with search results
      const foldersWithResults = new Set<string>();
      
      // Helper function to find all folders with matching notes
      const findFoldersWithResults = (folderId: string) => {
        if (folderHasSearchResults(folderId)) {
          foldersWithResults.add(folderId);
          
          // Also add all parent folders to ensure the path is visible
          let currentFolder = folders.find(f => f.id === folderId);
          while (currentFolder?.parent_id) {
            foldersWithResults.add(currentFolder.parent_id);
            currentFolder = folders.find(f => f.id === currentFolder?.parent_id);
          }
        }
        
        // Recursively check subfolders
        const subfolders = folders.filter(folder => folder.parent_id === folderId);
        subfolders.forEach(subfolder => findFoldersWithResults(subfolder.id));
      };
      
      // Start from root folders
      const rootFolders = folders.filter(folder => folder.parent_id === null);
      rootFolders.forEach(folder => findFoldersWithResults(folder.id));
      
      // Update expanded folders state
      setExpandedFolders(prev => {
        const newState = { ...prev };
        foldersWithResults.forEach(folderId => {
          newState[folderId] = true;
        });
        return newState;
      });
    }
  }, [searchQuery, folders, notes]);

  return (
    <>
      {/* Desktop header */}
      <header className="hidden md:flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          Notes
        </div>
      </header>
        {/* Mobile header */}
      <MobileHeader 
        title={selectedNote ? selectedNote.title : searchQuery ? "Search Results" : "Notes"} 
        showBackButton={!!selectedNote}
        onBackClick={() => setSelectedNote(null)}
      />
      
      {/* Mobile sidebar */}
      <MobileSidebar title="Folders">
        {renderFolderTree(null)}
        
        {folders.length === 0 && (
          <div className="text-sm text-muted-foreground px-2 py-4 text-center">
            No folders yet. Create your first folder to organize your notes.
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCreateFolderDialogOpen(true)} 
          className="w-full mt-4"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </MobileSidebar>
      
      <div className={cn(
        "flex flex-col px-3 sm:px-4 pb-4",
        isMobile ? "h-[calc(100vh-3.5rem)]" : "h-[calc(100vh-4rem)]"
      )}>
        {/* Desktop title and search */}
        <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">Your Notes</h2>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button size="sm" onClick={() => {
                if (selectedFolder) {
                  setCreateNoteDialogOpen(true);
                } else {
                  setShowFolderAlert(true);
                  setTimeout(() => setShowFolderAlert(false), 3000);
                }
              }} className="flex gap-2">
                <Plus className="h-4 w-4" />
                <span>New Note</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setCreateFolderDialogOpen(true);
              }} className="flex gap-2">
                <FolderPlus className="h-4 w-4" />
                <span>New Folder</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile search bar */}
        {isMobile && !selectedNote && (
          <div className="md:hidden flex items-center gap-2 my-2">            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              if (selectedFolder) {
                setCreateNoteDialogOpen(true);
              } else {
                setShowFolderAlert(true);
                setTimeout(() => setShowFolderAlert(false), 3000);
              }
            }} className="h-9 w-9 p-0">
              <Plus className="h-5 w-5" />
              <span className="sr-only">New Note</span>
            </Button>
          </div>
        )}
        
        {/* Main notes container with responsive layout */}
        <div className="notes-container h-full">
          {/* Folder sidebar - hidden on mobile */}
          <div className="hidden md:block border rounded-md p-2 sm:p-3 h-full overflow-auto">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="text-sm font-medium py-1 px-2 text-muted-foreground mb-2">Folders</div>
                {renderFolderTree(null)}
                
                {folders.length === 0 && (
                  <div className="text-sm text-muted-foreground px-2 py-4 text-center">
                    No folders yet. Create your first folder to organize your notes.
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCreateFolderDialogOpen(true)} 
                  className="w-full mt-4"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </>
            )}
          </div>          {/* Notes List and Editor */}
          <div className="border rounded-md h-full flex flex-col note-transition">
            {selectedNote ? (
              // Note editor view
              <div className="flex flex-col h-full">
                {!isMobile && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b p-2">
                    <div className="flex items-center ml-2">
                      <h3 className="text-lg font-medium">{selectedNote.title}</h3>
                      {selectedNote.folder_id && (
                        <span className="text-sm text-muted-foreground ml-2">
                          in {folders.find(f => f.id === selectedNote.folder_id)?.name || 'Unknown Folder'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">                      {editMode ? (
                        <Button size="sm" onClick={saveNote}>Save</Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            console.log("Switching to edit mode (desktop), content:", selectedNote.content);
                            setNoteContent(selectedNote.content);
                            setEditMode(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setItemToDelete({ type: 'note', id: selectedNote.id });
                          setDeleteDialogOpen(true);
                        }}
                      >                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-1">Delete</span>
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-auto">
                  {editMode ? (
                    <>
                      <NoteToolbar editor={editorInstance} className="mb-2" />
                      <div className="p-3 md:p-4">
                        <NoteEditor
                          content={noteContent}
                          onChange={setNoteContent}
                          className="h-full border-0"
                          onEditorReady={setEditorInstance}
                        />
                      </div>
                      {isMobile && (
                        <div className="p-2 flex justify-end border-t sticky bottom-0 bg-background">
                          <Button size="sm" onClick={saveNote}>Save</Button>
                        </div>
                      )}
                    </>
                  ) : (                    <div className="p-3 md:p-4">
                      <NoteViewer content={selectedNote.content} className="h-full" />
                      {isMobile && (
                        <div className="p-2 flex justify-end border-t sticky bottom-0 bg-background">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              console.log("Switching to edit mode, content:", selectedNote.content);
                              setNoteContent(selectedNote.content);
                              setEditMode(true);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>            ) : (              // Notes list view
              <div className="h-full p-3 overflow-auto flex items-center justify-center">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Display a welcome message instead of showing notes in the main container */}
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      {selectedFolder ? (
                        <>
                          <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <h4 className="text-sm font-medium mb-1">
                            {folders.find(f => f.id === selectedFolder)?.name || 'Folder'} selected
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Select a note from the sidebar or create a new note
                          </p>
                          <Button 
                            size="sm" 
                            onClick={() => setCreateNoteDialogOpen(true)}
                            className="mx-auto"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            New Note
                          </Button>
                        </>
                      ) : (
                        <>
                          <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <h4 className="text-sm font-medium mb-1">Select a folder to get started</h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Choose a folder from the sidebar to view and edit your notes
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Folder Dialog */}
      <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your notes.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Note Dialog */}
      <Dialog open={createNoteDialogOpen} onOpenChange={setCreateNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Create a new note in folder: {selectedFolder ? `"${folders.find(f => f.id === selectedFolder)?.name || 'Unknown folder'}"` : 'Please select a folder first'}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Note Title"
            value={newNoteName}
            onChange={(e) => setNewNoteName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNote} disabled={!selectedFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'note'
                ? "This note will be permanently deleted."
                : "This folder and all notes inside it will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Folder selection alert */}
      {showFolderAlert && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert variant="destructive" className="w-72">
            <AlertDescription>
              Please select a folder before creating a note
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}

export default function Notes() {
  return (
    <NotesMobileProvider>
      <NotesContent />
    </NotesMobileProvider>
  );
}
