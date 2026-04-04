// cli.js (Modern Version for inquirer v9+)

// We only need axios and fs for now. Inquirer will be loaded dynamically.
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:8000/api';
const TOKEN_FILE_PATH = path.join(__dirname, '.token_storage');

// --- Helper Functions for Token Management (No changes here) ---
function saveToken(token) {
  fs.writeFileSync(TOKEN_FILE_PATH, token);
  console.log('\n✅ Token saved successfully! You are now logged in.');
}

function loadToken() {
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    return fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
  }
  return null;
}

function getAuthHeaders() {
  const token = loadToken();
  if (!token) {
    console.error('\n❌ Error: You are not logged in. Please log in first.');
    return null;
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// =================================================================
// MAIN ASYNC FUNCTION TO RUN THE CLI
// We wrap everything in an async function to use the dynamic import.
// =================================================================
async function run() {
  // THE KEY FIX: Dynamically import the inquirer module.
  // We get the 'default' export and rename it to 'inquirer' for convenience.
  const { default: inquirer } = await import('inquirer');

  // --- Handler Functions (Now defined inside run()) ---
  async function handleLogin() {
    const credentials = await inquirer.prompt([
      { name: 'username', message: 'Enter username:' },
      { name: 'password', type: 'password', message: 'Enter password:' },
    ]);
    try {
      console.log('\nLogging in...');
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      saveToken(response.data.token);
    } catch (error) {
      console.error(`\n❌ Login Failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async function handleViewCourses() {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      console.log('\nFetching available courses...');
      const response = await axios.get(`${API_BASE_URL}/courses`, headers);
      console.log('\n--- Available Courses ---');
      if (response.data.length === 0) {
        console.log('No courses have been created yet.');
      } else {
        console.table(response.data.map(c => ({
          ID: c.id, Code: c.course_code, Name: c.course_name, Capacity: c.capacity,
          Schedule: `${c.day_of_week} ${c.start_time}-${c.end_time}`
        })));
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async function handleRegisterForCourse() {
    const headers = getAuthHeaders();
    if (!headers) return;
    const { courseId } = await inquirer.prompt([
      { name: 'courseId', message: 'Enter the ID of the course you want to register for:' },
    ]);
    try {
      console.log(`\nRegistering for course ID ${courseId}...`);
      await axios.post(`${API_BASE_URL}/enrollments`, { courseId: parseInt(courseId) }, headers);
      console.log('\n✅ Successfully registered for the course!');
    } catch (error) {
      console.error(`\n❌ Registration Failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async function handleCreateCourse() {
    const headers = getAuthHeaders();
    if (!headers) return;
    const courseDetails = await inquirer.prompt([
      { name: 'courseCode', message: 'Enter Course Code (e.g., CS101):' },
      { name: 'courseName', message: 'Enter Course Name:' },
      { name: 'capacity', message: 'Enter Capacity:', default: 50 },
      { name: 'dayOfWeek', type: 'list', message: 'Select Day:', choices: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] },
      { name: 'startTime', message: 'Enter Start Time (HH:MM:SS):', default: '09:00:00' },
      { name: 'endTime', message: 'Enter End Time (HH:MM:SS):', default: '10:30:00' },
    ]);
    try {
      console.log('\nCreating course...');
      await axios.post(`${API_BASE_URL}/courses`, courseDetails, headers);
      console.log('\n✅ Course created successfully!');
    } catch (error) {
      console.error(`\n❌ Error creating course: ${error.response?.data?.message || error.message}`);
    }
  }

  async function handleCreateUser() {
    const headers = getAuthHeaders();
    if (!headers) return;
    const userDetails = await inquirer.prompt([
      { name: 'username', message: 'Enter new username:' },
      { name: 'password', type: 'password', message: 'Enter new password:' },
      { name: 'fullName', message: 'Enter full name:' },
      { name: 'role', type: 'list', message: 'Select Role:', choices: ['STUDENT', 'ACADEMIC_OFFICE', 'ADMIN'] },
    ]);
    try {
      console.log('\nCreating user...');
      await axios.post(`${API_BASE_URL}/auth/register`, userDetails, headers);
      console.log('\n✅ User created successfully!');
    } catch (error) {
      console.error(`\n❌ Error creating user: ${error.response?.data?.message || error.message}`);
    }
  }

  // --- The Main Menu Loop (No changes here, except it's inside run()) ---
  async function mainMenu() {
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list', name: 'action', message: 'What would you like to do?',
          choices: [
            'Login',
            'View All Courses',
            { type: 'separator' }, // Modern syntax for separator
            'Register for a Course (as Student)',
            'Create a New Course (as Academic Office)',
            'Create a New User (as Admin)',
            { type: 'separator' },
            'Exit',
          ],
        },
      ]);

      switch (action) {
        case 'Login': await handleLogin(); break;
        case 'View All Courses': await handleViewCourses(); break;
        case 'Register for a Course (as Student)': await handleRegisterForCourse(); break;
        case 'Create a New Course (as Academic Office)': await handleCreateCourse(); break;
        case 'Create a New User (as Admin)': await handleCreateUser(); break;
        case 'Exit': console.log('\nGoodbye!'); return;
      }
      await inquirer.prompt({ name: 'continue', message: '\nPress Enter to continue...', type: 'input' });
    }
  }

  // Start the main menu
  await mainMenu();
}

// --- Start the CLI Application ---
console.log('--- Welcome to the CRS Backend CLI ---');
run();