# EduSync V2: Grade System Migration Guide

This guide explains how grade system preferences are now stored in the application.

## Overview of the Changes

Grade system settings are now stored in:

1. **User metadata in Supabase**: For cross-device persistence
2. **LocalStorage**: For immediate access without network requests
3. **React state**: For UI updates

**Supported Grade Systems:**
- **6best**: Traditional 1-6 scale where 6 is the best grade
- **1best**: Swiss-style 1-6 scale where 1 is the best grade  
- **IB**: International Baccalaureate 1-7 scale where 7 is the best grade
- **American**: Letter grades (A-F) with 4.0 scale values
- **Percentage**: 0-100% scale

## New Files Added

1. **Server Action**: `app/actions/grade-system.ts`  
   - Handles server-side updates to user metadata in Supabase

2. **React Hook**: `hooks/use-grade-system.ts`  
   - Provides a consistent way to access and update grade system preferences
   - Manages synchronization between localStorage and Supabase
   
3. **Utility Functions**: `utils/grade-settings.ts`  
   - Contains helper functions for grade-related operations
   
## Integration Instructions

### 1. For User Profile/Settings components

```tsx
import { useGradeSystem } from "@/hooks/use-grade-system";

function SettingsComponent() {
  const { gradeSystem, setGradeSystem, isLoading } = useGradeSystem();
  
  const handleGradeSystemChange = async (newSystem: '6best' | '1best' | 'ib') => {
    await setGradeSystem(newSystem);
    // Success message, etc.
  };
  
  return (
    <div>
      {/* Button for 6best */}
      <button 
        className={gradeSystem === '6best' ? 'active' : ''}
        onClick={() => handleGradeSystemChange('6best')}
      >
        6 is best
      </button>
      
      {/* Button for 1best */}
      <button 
        className={gradeSystem === '1best' ? 'active' : ''}
        onClick={() => handleGradeSystemChange('1best')}
      >
        1 is best
      </button>
      
      {/* Button for IB */}
      <button 
        className={gradeSystem === 'ib' ? 'active' : ''}
        onClick={() => handleGradeSystemChange('ib')}
      >
        IB (1-7)
      </button>
    </div>
  );
}
```

### 2. For Grade Display Components

```tsx
import { useGradeSystem, getGradeColor } from "@/hooks/use-grade-system";

function GradeDisplayComponent() {
  const { gradeSystem } = useGradeSystem();
  
  // Get color based on grade and system
  const getColor = (grade: number) => {
    return getGradeColor(grade, gradeSystem);
  };
  
  return (
    <div>
      <span className={getColor(grade)}>
        {grade}
      </span>
    </div>
  );
}
```

### 3. For Input Components

```tsx
import { useGradeSystem } from "@/hooks/use-grade-system";

function GradeInputComponent() {
  const { gradeSystem } = useGradeSystem();
  const [grade, setGrade] = useState(1);
  
  // Get range and label based on system
  const getGradeRange = () => {
    if (gradeSystem === '1best') {
      return { min: 1, max: 6, label: 'Grade (1-6, 1 is best)' };
    } else if (gradeSystem === 'ib') {
      return { min: 1, max: 7, label: 'Grade (1-7, 7 is best)' };
    } else {
      return { min: 1, max: 6, label: 'Grade (1-6, 6 is best)' };
    }
  };
  
  const { min, max, label } = getGradeRange();
  
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={grade}
        onChange={(e) => setGrade(Number(e.target.value))}
      />
    </div>
  );
}
```

## Migration Process

1. Update your imports from using direct localStorage access to using the hook:
   ```diff
   - const getGradeSystem = () => localStorage.getItem('gradeSystem') || '6best';
   + import { useGradeSystem } from "@/hooks/use-grade-system";
   + 
   + function Component() {
   +   const { gradeSystem } = useGradeSystem();
   ```

2. Replace direct modification of localStorage with the hook's setter:
   ```diff
   - localStorage.setItem('gradeSystem', newSystem);
   + await setGradeSystem(newSystem);
   ```

3. Replace custom color functions with the utility function:
   ```diff
   - const getGradeColor = (grade) => { /* custom implementation */ };
   + import { getGradeColor } from "@/hooks/use-grade-system";
   + 
   + // Then in component:
   + const colorClass = getGradeColor(grade, gradeSystem);
   ```
