-- Migration file for Notes feature
-- Creates tables for note_folders and notes

-- Create note_folders table
CREATE TABLE IF NOT EXISTS "note_folders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "parent_id" UUID REFERENCES note_folders(id) ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for note_folders
ALTER TABLE "note_folders" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'note_folders' AND policyname = 'Users can create their own folders'
  ) THEN
    CREATE POLICY "Users can create their own folders" 
      ON "note_folders" FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'note_folders' AND policyname = 'Users can view their own folders'
  ) THEN
    CREATE POLICY "Users can view their own folders" 
      ON "note_folders" FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'note_folders' AND policyname = 'Users can update their own folders'
  ) THEN
    CREATE POLICY "Users can update their own folders" 
      ON "note_folders" FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'note_folders' AND policyname = 'Users can delete their own folders'
  ) THEN
    CREATE POLICY "Users can delete their own folders" 
      ON "note_folders" FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create notes table
CREATE TABLE IF NOT EXISTS "notes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "content" TEXT DEFAULT '',
  "folder_id" UUID REFERENCES note_folders(id) ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for notes
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' AND policyname = 'Users can create their own notes'
  ) THEN
    CREATE POLICY "Users can create their own notes" 
      ON "notes" FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' AND policyname = 'Users can view their own notes'
  ) THEN
    CREATE POLICY "Users can view their own notes" 
      ON "notes" FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' AND policyname = 'Users can update their own notes'
  ) THEN
    CREATE POLICY "Users can update their own notes" 
      ON "notes" FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' AND policyname = 'Users can delete their own notes'
  ) THEN
    CREATE POLICY "Users can delete their own notes" 
      ON "notes" FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_note_folders_user_id ON note_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_note_folders_parent_id ON note_folders(parent_id);
