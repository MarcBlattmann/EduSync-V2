# Display Preferences Testing Guide

## Overview
The display preferences system has been successfully implemented! This allows users to choose between displaying "Average Grade" (raw values) or "GPA" (converted to 4.0 scale) as labels and values throughout the interface.

## What's Been Implemented

### ✅ Complete Display Preferences System
1. **Preference Management**: localStorage + Supabase sync with cross-device support
2. **Settings UI**: Toggle buttons in Settings → System section
3. **Label Updates**: Dynamic labels based on preference selection
4. **Grade Conversion**: Actual conversion to 4.0 GPA scale when "GPA" preference is selected

### ✅ Updated Components
1. **Main Dashboard** (`/protected/page.tsx`):
   - Average grade display with conversion
   - Subject averages with conversion
   - Dynamic labels

2. **Grades Page** (`/protected/grades/page.tsx`):
   - Statistics card with converted average grade
   - Subject averages with conversion
   - Dynamic labels

3. **Grades Table** (`/components/grades/grades-table.tsx`):
   - Individual grades maintain original format (NOT converted)
   - Only averages and statistics are converted when "GPA" is selected

### ✅ Conversion Logic
The `convertGradeForDisplay()` function converts **averages only** to 4.0 GPA scale:
- **6best** system: `(grade-1)/5 * 4.0`
- **1best** system: `(1-((grade-1)/5)) * 4.0`
- **IB** system: `(grade-1)/6 * 4.0`
- **Percentage** system: `(grade/100) * 4.0`
- **American** system: keeps original value (already 4.0 scale)

**Note**: Individual grade entries always maintain their original format regardless of display preference.

## How to Test

### 1. Access Settings
- Navigate to **Settings → System**
- Look for "Display Preference" section
- You'll see two toggle buttons: "Average Grade" and "GPA"

### 2. Test Label Changes
- Switch between preferences
- Labels should change from "Average Grade" to "GPA" throughout the app

### 3. Test Value Conversion
- **Example**: If you have a grade of 5.5 in 6best system:
  - "Average Grade" preference: shows `5.50`
  - "GPA" preference: shows `3.60` (converted to 4.0 scale)

### 4. Test Locations
Check these locations for changes:
- **Dashboard**: Grade overview card (averages converted)
- **Grades Page**: Statistics card and subject averages (averages converted)
- **Grades Table**: Individual grade entries (NOT converted - maintain original format)

### 5. Test Persistence
- Change preference and refresh page
- Preference should persist across sessions
- Works across different devices when logged in

## Grade System Examples

### 6best System (6 = best, 1 = worst)
- Grade 6.0 → GPA 4.00
- Grade 5.5 → GPA 3.60
- Grade 4.0 → GPA 2.40
- Grade 1.0 → GPA 0.00

### 1best System (1 = best, 6 = worst)
- Grade 1.0 → GPA 4.00
- Grade 1.5 → GPA 3.60
- Grade 3.0 → GPA 2.40
- Grade 6.0 → GPA 0.00

### IB System (7 = best, 1 = worst)
- Grade 7.0 → GPA 4.00
- Grade 6.0 → GPA 3.33
- Grade 4.0 → GPA 2.00
- Grade 1.0 → GPA 0.00

### Percentage System (100% = best, 0% = worst)
- Grade 100% → GPA 4.00
- Grade 90% → GPA 3.60
- Grade 75% → GPA 3.00
- Grade 60% → GPA 2.40

## Technical Implementation

### Files Modified
- `hooks/use-display-preferences.ts` - Preference management and conversion logic
- `app/actions/display-preferences.ts` - Supabase sync
- `app/protected/settings/page.tsx` - Settings UI
- `app/protected/page.tsx` - Dashboard integration
- `app/protected/grades/page.tsx` - Grades page integration
- `components/grades/grades-table.tsx` - Individual grade display

### Storage
- **Local**: localStorage for immediate UI updates
- **Cloud**: Supabase for cross-device sync
- **Fallback**: 'averageGrade' as default preference

## Status: ✅ COMPLETE

The display preferences system is now fully implemented and ready for use!
