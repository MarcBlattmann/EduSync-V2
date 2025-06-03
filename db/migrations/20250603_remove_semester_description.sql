-- Migration file: Remove description field from semesters table
-- Date: 2025-06-03
-- Description: Removes the optional description column from the semesters table

-- Remove the description column from semesters table
ALTER TABLE "semesters" DROP COLUMN IF EXISTS "description";
