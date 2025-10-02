# Schools Feature Implementation Guide

## Overview
This document explains the newly added Schools feature to EduSync-V2. Schools allow users to organize their grades by educational institution when attending multiple schools.

## Key Features
- **Optional Feature**: The app works perfectly without schools. school_id is nullable in the database.
- **Multiple Schools**: Track grades from different schools separately
- **School-based Filtering**: Filter and view grades by specific school
- **School-specific Averages**: Calculate statistics per school
- **Color Coding**: Each school has a unique color for easy identification
- **Archive Support**: Archive old schools without deleting grade history

## Database Changes

### Migration File
Location: `db/migrations/20251002_create_schools_table.sql`

#### New Table: schools
```sql
CREATE TABLE "schools" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "color" TEXT DEFAULT '#3b82f6',
  "is_archived" BOOLEAN DEFAULT false,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Grades Table Update
```sql
ALTER TABLE "grades" ADD COLUMN IF NOT EXISTS "school_id" UUID REFERENCES schools(id) ON DELETE SET NULL;
```

**Important**: The `school_id` column is nullable, ensuring backward compatibility. Existing grades without schools will continue to work.

### Applying the Migration
To apply the migration to your Supabase instance:
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the content of `20251002_create_schools_table.sql`
4. Execute the SQL

## File Structure

### New Files Created

#### 1. Types
- `web/types/school.ts` - TypeScript interfaces for School, CreateSchoolData, UpdateSchoolData, SchoolStats

#### 2. Server Actions
- `web/app/actions/school.ts` - CRUD operations: createSchool, updateSchool, deleteSchool, archiveSchool, unarchiveSchool
- `web/app/actions/school-preferences.ts` - Save user preferences for school filtering

#### 3. Hooks
- `web/hooks/use-schools.ts` - Main hook for managing school state
- `web/hooks/use-school-preferences.ts` - Hook for school filter preferences

#### 4. Components
- `web/components/schools/manage-schools-dialog.tsx` - Main dialog for managing schools
- `web/components/schools/create-school-dialog.tsx` - Form to create new schools
- `web/components/schools/edit-school-dialog.tsx` - Form to edit existing schools

### Modified Files
- `web/components/add-grade-dialog.tsx` - Added optional school selector dropdown

## Usage Examples

### Creating a School
```typescript
import { useSchools } from '@/hooks/use-schools';

function MyComponent() {
  const { createSchool } = useSchools();
  
  const handleCreate = async () => {
    const success = await createSchool({
      name: 'Harvard University',
      color: '#A51C30'
    });
    
    if (success) {
      console.log('School created successfully');
    }
  };
}
```

### Filtering Grades by School
```typescript
const filteredGrades = grades.filter(grade => 
  grade.school_id === selectedSchoolId
);
```

### Getting School Statistics
```typescript
const { getSchoolStats } = useSchools();

const stats = await getSchoolStats(schoolId);
// Returns: { total_grades, average_grade, subject_count, subjects, semester_averages }
```

## Integration Steps

### Step 1: Run Database Migration
Execute the SQL migration in your Supabase dashboard to create the schools table and add the school_id column to grades.

### Step 2: Import the Hook
In components where you want to use schools:
```typescript
import { useSchools } from '@/hooks/use-schools';

const { schools, activeSchools, createSchool, updateSchool } = useSchools();
```

### Step 3: Add School Management UI
Add the ManageSchoolsDialog to your settings or appropriate page:
```typescript
import { ManageSchoolsDialog } from '@/components/schools/manage-schools-dialog';

<ManageSchoolsDialog 
  open={manageSchoolsOpen} 
  onOpenChange={setManageSchoolsOpen} 
/>
```

### Step 4: Update Grade Interfaces (TODO)
Update all Grade interfaces in your app to include optional school_id:
```typescript
interface Grade {
  id: string;
  user_id: string;
  subject: string;
  grade: number;
  date: string;
  description?: string;
  semester_id?: string;
  school_id?: string;  // Add this
  created_at: string;
}
```

### Step 5: Integrate into Grades Page (TODO)
Add school filtering alongside semester filtering in:
- `web/app/protected/grades/page.tsx`
- `web/app/protected/page.tsx` (GradeStats component)
- `web/components/grades/grades-table.tsx`

## Backward Compatibility

The schools feature is designed to be completely optional:

1. **Nullable Column**: The `school_id` column in grades table is nullable
2. **Default Behavior**: If no school is selected when adding a grade, school_id remains NULL
3. **Existing Grades**: All existing grades will continue to work without any changes
4. **Statistics**: Averages and statistics calculations handle NULL school_id values properly
5. **Filtering**: Users can filter by "All schools" or "No school assigned"

## School Properties

### Color Coding
Each school has a color property (hex code) used for:
- Visual identification in lists
- Icon coloring in grade dialogs
- Chart differentiation (future feature)

Default colors provided:
- Blue: #3b82f6
- Green: #10b981
- Yellow: #f59e0b
- Red: #ef4444
- Purple: #8b5cf6
- Pink: #ec4899
- Teal: #14b8a6
- Orange: #f97316

### Archive vs Delete
- **Archive**: Soft delete - hides school from active list but preserves all data
- **Delete**: Hard delete - removes school entirely (grades keep school_id but it's orphaned)

## Next Steps

### Remaining Tasks
1. ✅ Database migration
2. ✅ Type definitions
3. ✅ Server actions
4. ✅ Hooks
5. ✅ UI components
6. ✅ Grade dialog integration
7. 🔲 Update Grade interfaces app-wide
8. 🔲 Add school filtering to grades page
9. 🔲 Add school column to grades table
10. 🔲 Integrate school statistics in dashboard
11. 🔲 Add school management to settings page
12. 🔲 Test backward compatibility

### Future Enhancements
- School-specific semester management
- Transfer grades between schools
- School performance comparison charts
- Export grades by school
- School-specific grade system preferences
- Bulk assign schools to existing grades

## Testing Checklist

### Functional Tests
- [ ] Create a new school
- [ ] Edit school name and color
- [ ] Archive a school
- [ ] Unarchive a school
- [ ] Delete a school
- [ ] Add a grade with a school
- [ ] Add a grade without a school
- [ ] Filter grades by school
- [ ] View school statistics
- [ ] Calculate averages with mixed school/no-school grades

### Edge Cases
- [ ] What happens to grades when their school is deleted?
- [ ] Can users create duplicate school names?
- [ ] Does archived school still show in historical data?
- [ ] Do calculations work with NULL school_id?
- [ ] Does the app work if user has never created any schools?

### UI/UX Tests
- [ ] School colors display correctly
- [ ] School selector is clearly optional in grade dialog
- [ ] Archive badge shows appropriately
- [ ] Search and filtering work smoothly
- [ ] Mobile responsiveness

## Support

For issues or questions about the schools feature:
1. Check this documentation
2. Review the TypeScript interfaces in `types/school.ts`
3. Check database schema in migration file
4. Test with the provided components

## License
This feature follows the same MIT License as the main EduSync-V2 project.
