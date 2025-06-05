-- Migration file for Semester Management System
-- Creates tables and relationships for semester functionality

-- Create semesters table
CREATE TABLE IF NOT EXISTS "semesters" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT false,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for semesters
ALTER TABLE "semesters" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own semesters
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'semesters' AND policyname = 'Users can create their own semesters'
  ) THEN
    CREATE POLICY "Users can create their own semesters" 
      ON "semesters" FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can view their own semesters
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'semesters' AND policyname = 'Users can view their own semesters'
  ) THEN
    CREATE POLICY "Users can view their own semesters"
      ON "semesters" FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can update their own semesters
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'semesters' AND policyname = 'Users can update their own semesters'
  ) THEN
    CREATE POLICY "Users can update their own semesters"
      ON "semesters" FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can delete their own semesters
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'semesters' AND policyname = 'Users can delete their own semesters'
  ) THEN
    CREATE POLICY "Users can delete their own semesters"
      ON "semesters" FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add semester_id column to grades table
ALTER TABLE "grades" ADD COLUMN IF NOT EXISTS "semester_id" UUID REFERENCES semesters(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "idx_grades_semester_id" ON "grades" ("semester_id");
CREATE INDEX IF NOT EXISTS "idx_semesters_user_id" ON "semesters" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_semesters_active" ON "semesters" ("user_id", "is_active");

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for semesters table
DROP TRIGGER IF EXISTS update_semesters_updated_at ON semesters;
CREATE TRIGGER update_semesters_updated_at
    BEFORE UPDATE ON semesters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one active semester per user
CREATE OR REPLACE FUNCTION ensure_single_active_semester()
RETURNS TRIGGER AS $$
BEGIN
    -- If the new/updated semester is being set to active
    IF NEW.is_active = true THEN
        -- Deactivate all other semesters for this user
        UPDATE semesters 
        SET is_active = false 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id 
        AND is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to ensure only one active semester per user
DROP TRIGGER IF EXISTS ensure_single_active_semester_trigger ON semesters;
CREATE TRIGGER ensure_single_active_semester_trigger
    BEFORE INSERT OR UPDATE ON semesters
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_semester();
