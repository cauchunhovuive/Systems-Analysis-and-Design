# Course Registration System (CRS) - Backend API

Welcome, frontend developers! 🚀

This document is your complete guide to the CRS backend. It contains everything you need to run the API on your local machine and understand how to interact with it to build the user interface.

## Table of Contents

1.  [Quick Start: Running the Backend](#quick-start-running-the-backend)
2.  [API Endpoint Information](#api-endpoint-information)
    *   [Base URL](#base-url)
    *   [Authentication (JWT Flow)](#authentication-jwt-flow)
3.  [API Endpoints Reference](#api-endpoints-reference)
    *   [Auth Endpoints](#auth-endpoints)
    *   [Course Endpoints](#course-endpoints)
    *   [Enrollment Endpoints](#enrollment-endpoints)
4.  [Test Users & Data](#test-users--data)
5.  [Using the Interactive CLI Tool](#using-the-interactive-cli-tool)

---

## Quick Start: Running the Backend

You only need one piece of software installed on your machine:
*   **Docker Desktop**

The entire backend system (the API, two databases, and the API gateway) is containerized. To run it, follow these simple steps:

1.  **Clone the Repository:**
    If you haven't already, clone this project to your machine.

2.  **Launch the System:**
    Open a terminal in the root directory of this project and run this single command:
    ```bash
    docker-compose up --build
    ```
    This will build the necessary images and start all the services. It may take a few minutes the first time. You can add a `-d` flag (`docker-compose up --build -d`) to run it in the background.

**That's it!** The entire backend is now running and accessible. To stop the system, you can press `Ctrl + C` in the terminal, or run `docker-compose down`.

---

## API Endpoint Information

### Base URL

All API endpoints are accessible through the Kong API Gateway at the following base URL:

**`http://localhost:8000/api`**

For example, the login endpoint is at `http://localhost:8000/api/auth/login`.

### Authentication (JWT Flow)

This API uses JSON Web Tokens (JWTs) for authentication. The flow is standard:

1.  **Login:** The user sends their `username` and `password` to the `POST /api/auth/login` endpoint.
2.  **Receive Token:** If the credentials are correct, the API returns a JWT.
3.  **Store Token:** Your frontend application should store this token securely (e.g., in Local Storage or a cookie).
4.  **Send Token:** For every subsequent request to a protected endpoint, you must include the token in the `Authorization` header with the `Bearer` scheme.

**Example Authorization Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If you make a request to a protected endpoint without a valid token, the API will respond with a `401 Unauthorized` or `403 Forbidden` error.

---

## API Endpoints Reference

### Auth Endpoints

#### `POST /api/auth/login`
*   **Description:** Authenticates a user and returns a JWT.
*   **Authorization:** None required.
*   **Request Body:**
    ```json
    {
      "username": "superadmin",
      "password": "strongPassword123"
    }
    ```
*   **Success Response (`200 OK`):**
    ```json
    {
      "user": {
        "id": 1,
        "username": "superadmin",
        "fullName": "Super Admin",
        "role": "ADMIN"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **Error Response (`401 Unauthorized`):**
    ```json
    { "message": "Invalid username or password" }
    ```

#### `POST /api/auth/register`
*   **Description:** Creates a new user.
*   **Authorization:** **Admin Token Required.**
*   **Request Body:**
    ```json
    {
      "username": "student1",
      "password": "password123",
      "fullName": "Test Student",
      "role": "STUDENT"
    }
    ```
*   **Success Response (`201 Created`):**
    ```json
    {
      "id": 2,
      "username": "student1",
      "full_name": "Test Student",
      "role": "STUDENT",
      "created_at": "2025-11-22T..."
    }
    ```
*   **Error Response (`409 Conflict`):**
    ```json
    { "message": "Username already exists" }
    ```

### Course Endpoints

#### `GET /api/courses`
*   **Description:** Retrieves a list of all available courses.
*   **Authorization:** Any valid token required (Student, Admin, etc.).
*   **Success Response (`200 OK`):**
    ```json
    [
      {
        "id": 1,
        "course_code": "CS101",
        "course_name": "Intro to Code",
        "capacity": 50,
        "day_of_week": "MONDAY",
        "start_time": "09:00:00",
        "end_time": "10:30:00",
        "...": "..."
      }
    ]
    ```

#### `POST /api/courses`
*   **Description:** Creates a new course.
*   **Authorization:** **Academic Office Token Required.**
*   **Request Body:**
    ```json
    {
      "courseCode": "CS101",
      "courseName": "Intro to Code",
      "description": "A great course!",
      "capacity": 50,
      "lecturerName": "Dr. Smith",
      "dayOfWeek": "MONDAY",
      "startTime": "09:00:00",
      "endTime": "10:30:00"
    }
    ```
*   **Success Response (`201 Created`):** Returns the newly created course object.

### Enrollment Endpoints

#### `POST /api/enrollments`
*   **Description:** Registers the currently logged-in student for a course.
*   **Authorization:** **Student Token Required.**
*   **Request Body:**
    ```json
    {
      "courseId": 1
    }
    ```
*   **Success Response (`201 Created`):** Returns the new enrollment record.
*   **Error Responses (`409 Conflict`):**
    ```json
    { "message": "Registration failed: Course is full." }
    ```
    ```json
    { "message": "You are already registered for this course." }
    ```
    ```json
    { "message": "Schedule conflict: This course conflicts with CS101..." }
    ```

#### `GET /api/enrollments/me`
*   **Description:** Retrieves a list of all courses the currently logged-in student is enrolled in.
*   **Authorization:** **Student Token Required.**
*   **Success Response (`200 OK`):** Returns an array of course objects.

---

## Test Users & Data

The database is automatically seeded with **one user** when you start the system:

*   **Username:** `superadmin`
*   **Password:** `strongPassword123`
*   **Role:** `ADMIN`

You **must** use this user to log in first. Once you are logged in as the admin, you can use the `POST /api/auth/register` endpoint to create other users with `STUDENT` or `ACADEMIC_OFFICE` roles for further testing.

---

### **Using the Interactive CLI Tool**

For easy testing and exploration, this project includes a powerful command-line tool. It provides an interactive menu to perform all the main API actions and serves as a live demonstration of the backend's functionality.

This is the **recommended way** to get familiar with the API flow.

#### **How to Start the CLI**

1.  **Ensure the backend is running.** In one terminal, you must have the system running via `docker-compose up`.
2.  **Launch the CLI.** In a **new terminal window**, navigate to the project's root directory and run this single command:

    ```bash
    npm run cli
    ```

You will be greeted with the main menu. Use the **Up/Down arrow keys** to select an option and **Enter** to confirm.

#### **CLI Workflow Example: A Full Walkthrough**

This example shows how to perform all the core functions of the system, demonstrating the different user roles.

**1. Login as the Default Administrator**

The system starts with only one user. You must log in as this user to do anything else.

*   Select **Login**.
*   Username: `superadmin`
*   Password: `strongPassword123`
*   You will see a confirmation that you are logged in. The CLI now holds your Admin token.

**2. Create the Necessary User Roles (Admin Task)**

As the admin, your job is to create the other users.

*   Select **Create a New User (as Admin)**.
*   Create an **Academic Office** user:
    *   Username: `acad_staff`
    *   Password: `password123`
    *   Full Name: `Jane Doe`
    *   Role: `ACADEMIC_OFFICE`
*   Run the "Create User" action again to create a **Student**:
    *   Username: `student1`
    *   Password: `password123`
    *   Full Name: `John Smith`
    *   Role: `STUDENT`

**3. Switch Roles: Become the Academic Staff**

Now we need to create a course, which is an Academic Office task.

*   Select **Login** again.
*   Log in with the credentials for the user you just created:
    *   Username: `acad_staff`
    *   Password: `password123`
*   The CLI will save this new user's token, and you are now acting as the Academic Staff.

**4. Create a Course (Academic Office Task)**

*   Select **Create a New Course (as Academic Office)**.
*   Fill in the details for the course as prompted. For example:
    *   Course Code: `CS101`
    *   Course Name: `Introduction to Programming`
    *   Capacity: `3` (Use a small number for easy testing!)
    *   Day: `MONDAY`
    *   Start Time: `09:00:00`
    *   End Time: `10:30:00`

**5. Switch Roles: Become the Student**

Time to register for the course!

*   Select **Login** one more time.
*   Log in as the student:
    *   Username: `student1`
    *   Password: `password123`
*   You are now acting as the Student.

**6. View Courses and Register (Student Task)**

*   Select **View All Courses**. A table will appear showing "CS101". Note its **ID** (it will be `1`).
*   Select **Register for a Course (as Student)**.
*   When asked for the course ID, enter `1`.
*   You will see a success message.

This walkthrough demonstrates the entire role-based security model and the core functionality of the API in an easy-to-follow, interactive way.s the best way to get a feel for the API flow
