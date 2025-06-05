// Test script for semester default preference system
// Save this file to: c:\Users\marcb\Documents\GitHub\EduSync-V2\web\test\semester-default-test.js

// This is a browser console script that can be run in the Chrome DevTools console
// to verify the semester default preference system is working correctly

async function testSemesterDefaultSystem() {
  console.log('Starting Semester Default Preference System Test...');
  
  // Test 1: Check localStorage initialization
  console.log('\n--- Test 1: localStorage Initialization ---');
  const storedValue = localStorage.getItem('defaultSemester');
  console.log(`Current localStorage value: ${storedValue || 'none'}`);
  
  // Test 2: Check if the current preference is reflected in the UI
  console.log('\n--- Test 2: UI Reflection ---');
  console.log('Navigate to Settings page and check that the correct option is highlighted');
  console.log('This must be verified visually');
  
  // Test 3: Test setting different preferences
  console.log('\n--- Test 3: Preference Setting ---');
  // We'll set preferences manually here for testing
  console.log('Setting preference to "all"...');
  localStorage.setItem('defaultSemester', 'all');
  console.log('Please refresh the page and verify that the Grade Overview shows all semesters');
  
  // Wait for user to verify
  await new Promise(resolve => {
    console.log('Press any key to continue...');
    document.addEventListener('keydown', function handler() {
      document.removeEventListener('keydown', handler);
      resolve();
    }, { once: true });
  });
  
  console.log('Setting preference to "active"...');
  localStorage.setItem('defaultSemester', 'active');
  console.log('Please refresh the page and verify that the Grade Overview shows the active semester');
  
  // Wait for user to verify
  await new Promise(resolve => {
    console.log('Press any key to continue...');
    document.addEventListener('keydown', function handler() {
      document.removeEventListener('keydown', handler);
      resolve();
    }, { once: true });
  });
  
  // Test 4: Get a specific semester ID to test with
  console.log('\n--- Test 4: Specific Semester Test ---');
  console.log('Getting available semesters...');
  
  // Wait for user to navigate to Settings
  console.log('Please navigate to the Settings page');
  await new Promise(resolve => {
    console.log('Press any key when you are on the Settings page...');
    document.addEventListener('keydown', function handler() {
      document.removeEventListener('keydown', handler);
      resolve();
    }, { once: true });
  });
  
  // We'll need to get the semester IDs from the DOM
  // This is a hacky way to do it, but it works for testing
  const semesterButtons = Array.from(document.querySelectorAll('button'))
    .filter(button => button.textContent.includes('Fall') || 
                      button.textContent.includes('Spring') || 
                      button.textContent.includes('Summer') ||
                      button.textContent.includes('Winter'));
  
  if (semesterButtons.length === 0) {
    console.log('No semester buttons found. Make sure you are on the Settings page');
    return;
  }
  
  // Click the first specific semester button to select it
  console.log(`Found ${semesterButtons.length} semester buttons`);
  console.log('Clicking the first specific semester button...');
  semesterButtons[0].click();
  
  // Check localStorage after clicking
  const newStoredValue = localStorage.getItem('defaultSemester');
  console.log(`New localStorage value: ${newStoredValue || 'none'}`);
  
  // Test 5: Verify that the preference is correctly applied on page load
  console.log('\n--- Test 5: Page Load Verification ---');
  console.log('Please navigate to the Home page and then back to Settings');
  console.log('Verify that the same specific semester option is still highlighted');
  
  // Test 6: Check browser persistence
  console.log('\n--- Test 6: Browser Persistence ---');
  console.log('Please open a new tab, navigate to the application, and verify the preference is still applied');
  
  console.log('\nTest complete! Check the documentation for any issues that need to be addressed.');
}

// Run the test
testSemesterDefaultSystem().catch(console.error);
