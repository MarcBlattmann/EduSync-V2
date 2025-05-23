-- Migration file for Note Sharing feature
-- Creates a table for note_shares to enable sharing notes with others

-- Create note_shares table
CREATE TABLE IF NOT EXISTS "note_shares" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "note_id" UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  "share_code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE,
  "active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for note_shares
ALTER TABLE "note_shares" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'note_shares' AND policyname = 'Users can create their own note shares'
  ) THEN
    CREATE POLICY "Users can create their own note shares" 
      ON "note_shares" FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'note_shares' AND policyname = 'Users can view their own note shares'
  ) THEN
    CREATE POLICY "Users can view their own note shares" 
      ON "note_shares" FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'note_shares' AND policyname = 'Users can update their own note shares'
  ) THEN
    CREATE POLICY "Users can update their own note shares" 
      ON "note_shares" FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'note_shares' AND policyname = 'Users can delete their own note shares'
  ) THEN
    CREATE POLICY "Users can delete their own note shares" 
      ON "note_shares" FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'note_shares' AND policyname = 'Anyone can view active note shares with share code'
  ) THEN
    CREATE POLICY "Anyone can view active note shares with share code" 
      ON "note_shares" FOR SELECT 
      USING (active = true AND (expires_at IS NULL OR expires_at > now()));
  END IF;
END $$;

-- Create index on share_code
CREATE INDEX IF NOT EXISTS idx_note_shares_share_code ON note_shares(share_code);

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_note_shares_user_id ON note_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_note_shares_note_id ON note_shares(note_id);

-- Create policy for notes table to allow viewing shared notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' AND policyname = 'Allow viewing shared notes'
  ) THEN
    CREATE POLICY "Allow viewing shared notes" 
      ON "notes" FOR SELECT 
      USING (EXISTS (
        SELECT 1 FROM note_shares 
        WHERE note_shares.note_id = id 
        AND note_shares.active = true 
        AND (note_shares.expires_at IS NULL OR note_shares.expires_at > now())
      ));
  END IF;
END $$;
