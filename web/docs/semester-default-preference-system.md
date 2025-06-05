# Semester Default Preference System

This document describes the semester default preference system implementation in EduSync V2.

## Overview

The semester default preference system allows users to choose which semester is selected by default when viewing grades and summaries. This preference is applied to both the home page Grade Overview and the Grades page.

## Preference Options

Users can choose from three types of preferences:

1. **All Semesters** - Show grades from all time periods by default
2. **Active Semester** - Show only the currently active semester by default
3. **Specific Semester** - Show a particular semester by default

When no preference is set, the system defaults to showing the active semester.

## Implementation Details

### Client-Side State Management

The semester default preference is managed through the `useSemesterDefault` hook, which:

- Initializes the preference from localStorage with a fallback to 'active'
- Loads the preference from Supabase user metadata on component mount
- Provides functions to get and set the preference
- Syncs the preference between localStorage and Supabase
- Ensures consistency across tabs via the StorageEvent API

### Server-Side Storage

Preferences are stored in Supabase as user metadata under the `default_semester` key, which can be:
- `'all'` - For all semesters
- `'active'` - For the currently active semester
- `{semester_id}` - A UUID string for a specific semester

### Helper Functions

Two key helper functions support the preference system:

1. `getDefaultSemesterId` - Determines which semester ID to use based on the preference, semesters list, and active semester
2. `getSemesterDefaultLabel` - Provides a human-readable label for the preference

### UI Integration

The preference system is integrated in three main places:

1. **Settings Page** - System tab allows users to select their preference
2. **Home Page** - Grade Overview initializes with the preferred semester
3. **Grades Page** - Grades list initializes with the preferred semester

## UI Improvements

As part of this implementation, several UI improvements were made:

1. **Responsive Dropdown Width** - Dropdowns now calculate their width based on content and screen size
2. **Proper Positioning** - Dropdowns use `position="popper" side="bottom" align="start"` to prevent clipping
3. **Text Truncation** - Long semester names are truncated with ellipsis
4. **Mobile Optimization** - The UI is optimized for mobile devices with appropriate spacing and width handling

## Testing

See the following documents for testing procedures:
- [Semester Default Testing](./semester-default-testing.md)
- [Semester Dropdown UI Test](./semester-dropdown-ui-test.md)

## Codebase References

Key files involved in this implementation:

- `hooks/use-semester-default.ts` - The main hook for managing preferences
- `app/actions/semester-preferences.ts` - Server action for saving preferences to Supabase
- `app/protected/settings/page.tsx` - UI for selecting preferences
- `app/protected/page.tsx` - Home page integration
- `app/protected/grades/page.tsx` - Grades page integration
