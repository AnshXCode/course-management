-- Course Management System — database schema
--
-- Fresh setup:
--   createdb course_management
--   psql course_management -f server/db/schema.sql
--
-- From server/ directory:
--   psql course_management -f db/schema.sql

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
CREATE TABLE courses (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  capacity    INTEGER      NOT NULL DEFAULT 30,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX courses_code_key ON courses (code);

-- ---------------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------------
CREATE TABLE students (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL,
  email      VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX students_username_key ON students (username);
CREATE UNIQUE INDEX students_email_key ON students (email);

-- ---------------------------------------------------------------------------
-- enrollments (many-to-many: students ↔ courses)
-- student_name / course_name are denormalized for display in the UI
-- ---------------------------------------------------------------------------
CREATE TABLE enrollments (
  id           SERIAL PRIMARY KEY,
  student_id   INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id    INTEGER      NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  student_name VARCHAR(255),
  course_name  VARCHAR(255),
  enrolled_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, course_id)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
