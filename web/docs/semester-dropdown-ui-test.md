# UI Responsiveness Test for Semester Dropdowns

This document outlines a testing procedure to validate the UI fixes for semester dropdowns on small screens.

## Test Environment
- Current date: June 4, 2025
- Browser: Chrome with DevTools for device simulation
- Test account: Use a test account with multiple semesters including ones with long names

## Test Procedure

### 1. Desktop View Tests

#### Home Page Dropdown
- [ ] Navigate to the home page
- [ ] Click on the semester dropdown
- [ ] Verify that the dropdown appears below the trigger without clipping
- [ ] Verify that the dropdown width is appropriate (not too narrow or too wide)
- [ ] Verify that long semester names are properly truncated with ellipsis
- [ ] Verify that the dropdown positioning uses `position="popper" side="bottom" align="start"`
- [ ] Verify that the maximum width calculation (`Math.min(400, window.innerWidth * 0.7)`) is working

#### Grades Page Dropdown
- [ ] Navigate to the grades page
- [ ] Click on the semester dropdown
- [ ] Verify that the dropdown appears below the trigger without clipping
- [ ] Verify that the dropdown width is appropriate (not too narrow or too wide)
- [ ] Verify that long semester names are properly truncated with ellipsis
- [ ] Verify that the dropdown positioning uses `position="popper" side="bottom" align="start"`
- [ ] Verify that the maximum width calculation (`Math.min(400, window.innerWidth * 0.7)`) is working

### 2. Mobile View Tests (320px width)

#### Home Page Dropdown
- [ ] Using Chrome DevTools, set the device to iPhone SE or similar small device (320px width)
- [ ] Navigate to the home page
- [ ] Click on the semester dropdown
- [ ] Verify that the dropdown appears below the trigger without clipping off-screen
- [ ] Verify that the dropdown width is appropriate for the screen size
- [ ] Verify that long semester names are properly truncated with ellipsis

#### Grades Page Dropdown
- [ ] Navigate to the grades page
- [ ] Click on the semester dropdown
- [ ] Verify that the dropdown appears below the trigger without clipping off-screen
- [ ] Verify that the dropdown width is appropriate for the screen size
- [ ] Verify that long semester names are properly truncated with ellipsis

### 3. Settings Page Tests

#### Desktop View
- [ ] Navigate to Settings > System tab
- [ ] Verify that the semester buttons display correctly with proper spacing
- [ ] Verify that long semester names are properly truncated with ellipsis
- [ ] Verify that the buttons use `w-full` for full width display

#### Mobile View (320px width)
- [ ] Using Chrome DevTools, set the device to iPhone SE or similar small device (320px width)
- [ ] Navigate to Settings > System tab
- [ ] Verify that the semester buttons display correctly with proper spacing
- [ ] Verify that long semester names are properly truncated with ellipsis
- [ ] Verify that the buttons stack properly in the grid layout
- [ ] Verify that text doesn't overflow the buttons

## Test Results

### Issues Found
- *Document any issues discovered during testing here*

### Recommendations
- *Document any recommendations for improvements here*
