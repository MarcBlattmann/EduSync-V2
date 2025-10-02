-- Migration file for School Management System
-- Creates schools table and adds school_id to grades table

-- Create schools table
CREATE TABLE IF NOT EXISTS "schools" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "color" TEXT DEFAULT '#3b82f6',
  "is_archived" BOOLEAN DEFAULT false,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for schools
ALTER TABLE "schools" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own schools
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'schools' AND policyname = 'Users can create their own schools'
  ) THEN
    CREATE POLICY "Users can create their own schools" 
      ON "schools" FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can view their own schools
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'schools' AND policyname = 'Users can view their own schools'
  ) THEN
    CREATE POLICY "Users can view their own schools" 
      ON "schools" FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can update their own schools
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'schools' AND policyname = 'Users can update their own schools'
  ) THEN
    CREATE POLICY "Users can update their own schools" 
      ON "schools" FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: Users can delete their own schools
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'schools' AND policyname = 'Users can delete their own schools'
  ) THEN
    CREATE POLICY "Users can delete their own schools"
      ON "schools" FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add school_id column to grades table (nullable for backward compatibility)
ALTER TABLE "grades" ADD COLUMN IF NOT EXISTS "school_id" UUID REFERENCES schools(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_grades_school_id" ON "grades" ("school_id");
CREATE INDEX IF NOT EXISTS "idx_schools_user_id" ON "schools" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_schools_archived" ON "schools" ("user_id", "is_archived");

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_schools_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for schools
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at 
    BEFORE UPDATE ON schools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_schools_updated_at_column();

-- Add comment to table
COMMENT ON TABLE schools IS 'Stores user schools for organizing grades by educational institution';
COMMENT ON COLUMN schools.color IS 'Hex color code for visual identification of school';
COMMENT ON COLUMN schools.is_archived IS 'Soft delete - archived schools are hidden but data is preserved';
