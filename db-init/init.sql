-- db-init/init.sql

-- Drop existing tables to ensure a clean slate on every start (great for development)
DROP TABLE IF EXISTS "enrollments" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TYPE IF EXISTS "user_role";
DROP TYPE IF EXISTS "day_of_week_enum";
DROP TYPE IF EXISTS "status_enum";
DROP TYPE IF EXISTS "level_enum";

-- Create an ENUM type for user roles for data integrity
CREATE TYPE "user_role" AS ENUM ('STUDENT', 'ACADEMIC_OFFICE', 'ADMIN');
CREATE TYPE "day_of_week_enum" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE "status_enum" AS ENUM ('SUCCESS', 'PENDING', 'FAILED');
CREATE TYPE "level_enum" AS ENUM ('Undergraduate', 'Graduate');

-- Create the users table
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(50) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "full_name" VARCHAR(50) NOT NULL,
  "role" user_role NOT NULL,
  "address" VARCHAR(100),
  "phone" VARCHAR(10),
  "dob" DATE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the courses table
CREATE TABLE "courses" (
  "id" SERIAL PRIMARY KEY,
  "course_code" VARCHAR(10) NOT NULL,
  "course_name" VARCHAR(50) NOT NULL,
  "group_code" VARCHAR(10) NOT NULL,
  "description" TEXT,
  "capacity" INTEGER NOT NULL,
  "lecturer_name" VARCHAR(50) NOT NULL,
  "day_of_week" day_of_week_enum NOT NULL,
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "level" level_enum NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the enrollments join table
CREATE TABLE "enrollments" (
  "id" SERIAL PRIMARY KEY,
  "student_id" INTEGER NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "course_id" INTEGER NOT NULL REFERENCES "courses"(id) ON DELETE CASCADE,
  "status" status_enum NOT NULL,
  "enrollment_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Add a unique constraint to prevent duplicate enrollments
  CONSTRAINT "unique_student_course" UNIQUE ("student_id", "course_id")
);

INSERT INTO users (email, password_hash, full_name, role)
VALUES ('superadmin@mail.com', '$2b$10$kZZj7Bb17dk.coxYLqFqFu0KxjEMjVSUuRBh.6YiLAb.s6hueiOay', 'Super Admin', 'ADMIN');

--- passwords are 'password123'
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('a@mail.com', '$2b$10$W5oS4Ix84ndGU3qKQoVRoufnuUnsBu3RT5WqPdPz5xLaqRtFNptEW', 'Malandra Jay', 'STUDENT');

INSERT INTO users (email, password_hash, full_name, role)
VALUES ('b@mail.com', '$2b$10$9tVpeMBHlA90UNyKnKo4kufJUekZpk2Y8wdStiPm2YsrcN54Mru5O', 'Darwin Ariana', 'STUDENT');

INSERT INTO users (email, password_hash, full_name, role)
VALUES ('c@mail.com', '$2b$10$RSzUdBhKktCsXeM0kOLHH.2b3mrx9hKxdt4odH5hpSsmPDeinFZMq', 'Rupert Shanene', 'STUDENT');

INSERT INTO courses (course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level)
VALUES ('CO3001', 'Software Engineering', 'CC01', 60, ' Marlena Zavanna', 'MONDAY', '07:00', '09:00', 'Undergraduate');

INSERT INTO courses (course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level)
VALUES ('CO3001', 'Software Engineering', 'L02', 60, ' Bambi Weldon', 'MONDAY', '08:00', '10:00', 'Undergraduate');

INSERT INTO courses (course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level)
VALUES ('CO2013', 'Database Systems', 'TN01', 40, ' Benjamin Dulcie', 'FRIDAY', '13:00', '15:00', 'Undergraduate');

INSERT INTO courses (course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level)
VALUES ('CO5001', 'Data Mining', 'CC03', 20, ' Jeanette Trent', 'THURSDAY', '09:00', '11:00', 'Graduate');

INSERT INTO courses (course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level)
VALUES ('CO2039', 'Game Development', 'CC01', 30, 'Kelsie Hammond', 'TUESDAY', '16:00', '18:00', 'Undergraduate');

CREATE OR REPLACE FUNCTION assign_status()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
DECLARE
   course_capacity INT;
   max_capacity INT;
BEGIN
   SELECT COUNT(*) FROM enrollments WHERE course_id = NEW.course_id
   INTO course_capacity;

   SELECT capacity FROM courses WHERE id = NEW.course_id
   INTO max_capacity;

   IF course_capacity = max_capacity THEN
      NEW.status = 'PENDING';
   ELSE
      NEW.status = 'SUCCESS';
   END IF;
   RETURN NEW;
END;
$$;

CREATE TRIGGER assign_status_before_insert
BEFORE INSERT
ON enrollments
FOR EACH ROW
EXECUTE FUNCTION assign_status();