# Beta Features System Implementation

## Overview
Implemented a beta features system to control experimental features in EduSync. The schools feature is now hidden behind a beta flag that users must explicitly enable in settings.

## Architecture

### 1. Beta Features Hook (`hooks/use-beta-features.ts`)
- Manages feature flags with localStorage + Supabase sync
- **Default State**: All features disabled by default
- **Features**:
  - `schoolsEnabled`: boolean (default: `false`)
- **Methods**:
  - `setBetaFeatures()`: Update one or more features
  - `toggleFeature()`: Toggle a single feature on/off
- **Storage**: Syncs between localStorage (instant) and Supabase user_metadata (persistent across devices)

### 2. Server Action (`app/actions/beta-features.ts`)
- `saveBetaFeaturesToSupabase()`: Saves beta preferences to user metadata
- Follows same pattern as grade system and display preferences

### 3. Settings UI Integration
**Location**: Settings Page → System Tab → Beta Features Card

**Features**:
- 🧪 Experimental badge and warning
- 🎯 Toggle for Schools feature
- ⚠️ Warning message about beta status
- 📊 Auto-saves on toggle (with loading states)
- ✅ Success feedback

**Visual Design**:
- Orange theme (border-orange-200/900) to indicate beta status
- FlaskConical icon for experimentation
- Checkbox toggle (not switch as component doesn't exist)
- Clear description of what each feature does

### 4. Schools Hook Integration (`hooks/use-schools.ts`)
**Changes**:
- Imports `useBetaFeatures` hook
- Checks `schoolsEnabled` flag before fetching data
- Returns empty arrays when disabled
- Exports `schoolsEnabled` flag for components
- Re-fetches when feature is toggled

**Behavior**:
- ✅ Feature Enabled: Normal operation, loads schools from DB
- ❌ Feature Disabled: Returns `[]` for schools/activeSchools, skips DB queries

### 5. UI Components Updated

#### Add Grade Dialog (`components/add-grade-dialog.tsx`)
- **No changes needed!** 
- Already checks `activeSchools.length > 0` before showing selector
- Since hook returns `[]` when disabled, selector auto-hides

#### Grades Page (`app/protected/grades/page.tsx`)
**Changes**:
1. Imports `schoolsEnabled` from `useSchools` hook
2. Wraps "Manage Schools" button in `{schoolsEnabled && ...}`
3. Wraps school filter dropdown in `{activeSchools.length > 0 && ...}` (existing)
4. Wraps `ManageSchoolsDialog` in `{schoolsEnabled && ...}`

**Result**: All schools UI elements completely hidden when feature is disabled

## User Flow

### Enabling Schools Feature
1. User goes to Settings → System tab
2. Scrolls to "Beta Features" card (orange theme)
3. Enables "Schools Feature" checkbox
4. Success message appears
5. Setting syncs to Supabase
6. All pages automatically update:
   - ✅ "Manage Schools" button appears in Grades page
   - ✅ School selector appears in Add Grade dialog (if schools exist)
   - ✅ School filter appears in stats card (if schools exist)

### Disabling Schools Feature
1. User unchecks "Schools Feature" in settings
2. Preference saved
3. All schools UI instantly hides across entire app:
   - ❌ "Manage Schools" button removed
   - ❌ School selectors removed
   - ❌ School filters removed
4. **Data preserved**: Schools and grade associations remain in database

## Benefits

### 1. **Gradual Rollout**
- Features can be tested by early adopters
- Reduces risk of bugs affecting all users
- Allows iteration based on feedback

### 2. **User Control**
- Users opt-in to experimental features
- Clear warning about beta status
- Can disable if experiencing issues

### 3. **Clean UX**
- New users don't see complex features they don't need
- UI remains simple by default
- Power users can unlock advanced features

### 4. **Data Safety**
- Disabling feature doesn't delete data
- Database migrations remain backward compatible
- Can re-enable feature without data loss

### 5. **Extensible System**
- Easy to add new beta features in the future
- Consistent pattern across the app
- Centralized configuration

## Technical Details

### State Management Flow
```
1. User toggles checkbox in Settings
2. handleBetaFeatureToggle() called
3. setBetaFeatures() updates localStorage (instant UI update)
4. saveBetaFeaturesToSupabase() updates Supabase (cloud sync)
5. Storage event dispatched
6. Other components listen and update
7. useSchools hook re-fetches (or clears) data
```

### Performance
- **localStorage**: Instant updates (no network delay)
- **Supabase sync**: Happens asynchronously
- **Cross-device**: Preferences load from Supabase on login
- **Reactive**: useEffect with `schoolsEnabled` dependency auto-updates

### Backward Compatibility
✅ **Fully Backward Compatible**
- Existing users: Feature disabled by default
- New users: Feature disabled by default
- Database: `school_id` is nullable
- Grades without schools: Work perfectly
- No breaking changes

## Future Beta Features

The system is designed to easily accommodate new experimental features:

```typescript
export interface BetaFeatures {
  schoolsEnabled: boolean;
  // Future features:
  // aiSuggestionsEnabled: boolean;
  // advancedAnalyticsEnabled: boolean;
  // collaborationEnabled: boolean;
}
```

Simply add to the interface and create a new checkbox in settings!

## Files Modified

### New Files
1. `web/hooks/use-beta-features.ts` - Feature flags hook
2. `web/app/actions/beta-features.ts` - Server action for Supabase sync

### Modified Files
1. `web/app/protected/settings/page.tsx` - Added Beta Features section
2. `web/hooks/use-schools.ts` - Added feature flag check
3. `web/app/protected/grades/page.tsx` - Conditional rendering based on flag

### No Changes Needed
- `web/components/add-grade-dialog.tsx` - Already had conditional logic

## Testing Checklist

- [ ] Navigate to Settings → System tab
- [ ] Verify "Beta Features" card appears with orange theme
- [ ] Verify Schools toggle is unchecked by default
- [ ] Check Grades page - no "Manage Schools" button
- [ ] Check Add Grade dialog - no school selector
- [ ] Enable Schools feature in settings
- [ ] Verify success message appears
- [ ] Verify "Manage Schools" button now visible
- [ ] Create a school, verify selector appears
- [ ] Disable Schools feature
- [ ] Verify all schools UI disappears
- [ ] Re-enable feature
- [ ] Verify previously created schools still exist

## Database Schema
**No changes required!** The schools table and grade.school_id column already exist from previous implementation. The beta system just controls UI visibility.

## Conclusion

The schools feature is now properly gated behind a beta flag that is **disabled by default**. Users must explicitly opt-in through Settings → System → Beta Features. This provides:

- Safe gradual rollout
- User control over complexity
- Clean default experience
- Foundation for future experimental features

The implementation follows the existing patterns (grade system, display preferences, semester defaults) for consistency and maintainability.
