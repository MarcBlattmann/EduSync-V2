# School Subjects Feature - Migration Guide

## Overview
This migration adds a `subjects` field to schools, allowing automatic school selection when adding grades.

## Database Migration

### Run via Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `/db/migrations/20251003_add_subjects_to_schools.sql`
4. Click "Run"

### Manual SQL (if needed)
```sql
ALTER TABLE "schools" 
ADD COLUMN IF NOT EXISTS "subjects" JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_schools_subjects ON "schools" USING gin ("subjects");
```

## How It Works

### 1. Adding Subjects to Schools
- When creating or editing a school, you can now add subjects (e.g., "Math", "Physics", "Chemistry")
- Subjects appear as chips/tags that can be added or removed
- Press Enter or click "Add" to add a subject

### 2. Automatic School Selection
When adding a new grade:
- If you select a subject that belongs to **only one school**, that school is automatically selected
- If the subject doesn't belong to any school, no school is selected
- If the subject belongs to multiple schools, you need to manually select which one
- When editing existing grades, auto-selection is disabled to preserve your choice

### 3. Example Workflow
1. Create "School A" and add subjects: Math, Physics
2. Create "School B" and add subjects: Chemistry, Biology
3. When adding a grade for "Math" → School A is auto-selected
4. When adding a grade for "History" → No school selected (not assigned to any school)

## Features
✅ Add/remove subjects from schools via UI
✅ Auto-select school based on subject
✅ Visual subject chips with remove button
✅ Press Enter to quickly add subjects
✅ Subjects stored as JSONB array in database
✅ GIN index for fast subject lookups

## Implementation Details

### Files Modified
- `web/types/school.ts` - Added `subjects?: string[]` to School interface
- `web/app/actions/school.ts` - Handle subjects in create/update actions
- `web/components/schools/create-school-dialog.tsx` - Subject management UI
- `web/components/schools/edit-school-dialog.tsx` - Subject management UI
- `web/components/add-grade-dialog.tsx` - Auto-selection logic
- `db/migrations/20251003_add_subjects_to_schools.sql` - Database migration

### Database Schema
```typescript
interface School {
  id: string;
  name: string;
  color: string;
  subjects?: string[]; // NEW: Array of subject names
  is_archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

## Testing
1. Enable schools in Beta Features (Settings → System → Beta Features)
2. Create a new school and add some subjects
3. Go to Grades and click "Add Grade"
4. Select a subject you added to the school
5. Verify the school is automatically selected

## Notes
- Subjects are case-sensitive
- Duplicate subjects in the same school are prevented
- The feature is fully backward compatible (existing schools will have empty subject arrays)
- Migration is safe to run multiple times (uses IF NOT EXISTS)
