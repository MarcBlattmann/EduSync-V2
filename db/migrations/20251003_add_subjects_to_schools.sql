-- Migration: Add subjects column to schools table
-- This allows schools to have associated subjects for automatic school selection

-- Add subjects column as JSONB array
ALTER TABLE "schools" 
ADD COLUMN IF NOT EXISTS "subjects" JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN "schools"."subjects" IS 'Array of subject names associated with this school (e.g., ["Math", "Physics", "Chemistry"])';

-- Create an index for faster subject lookups
CREATE INDEX IF NOT EXISTS idx_schools_subjects ON "schools" USING gin ("subjects");
