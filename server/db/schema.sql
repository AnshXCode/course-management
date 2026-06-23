-- Course Management System — database schema
--
-- Fresh local setup:
--   brew services start postgresql@16   # or your installed version
--   createdb course_management
--   psql course_management -f server/db/schema.sql
--
-- From server/ directory:
--   psql course_management -f db/schema.sql
--
-- Connection string (.env):
--   DATABASE_URL=postgresql://localhost:5432/course_management
--
-- If you wiped tables with DROP SCHEMA public CASCADE, recreate public first:
--   psql course_management -c "CREATE SCHEMA IF NOT EXISTS public; GRANT ALL ON SCHEMA public TO public; GRANT ALL ON SCHEMA public TO CURRENT_USER;"

-- Ensure tables are created in public (fixes "no schema has been selected to create in")
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO CURRENT_USER;
SET search_path TO public;

-- ---------------------------------------------------------------------------
-- users (auth — login / register / email verification)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR(255) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           VARCHAR(50)  NOT NULL DEFAULT 'viewer',
  email_verified BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_key UNIQUE (email)
);

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
CREATE TABLE courses (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  capacity    INTEGER      NOT NULL DEFAULT 30,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT courses_code_key UNIQUE (code)
);

-- ---------------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------------
CREATE TABLE students (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL,
  email      VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT students_username_key UNIQUE (username),
  CONSTRAINT students_email_key UNIQUE (email)
);

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
  CONSTRAINT enrollments_student_id_course_id_key UNIQUE (student_id, course_id)
);

CREATE INDEX enrollments_course_id_idx ON enrollments (course_id);
CREATE INDEX enrollments_student_id_idx ON enrollments (student_id);

-- ---------------------------------------------------------------------------
-- assignments (v2 API — Prisma)
-- ---------------------------------------------------------------------------
CREATE TABLE assignments (
  id          SERIAL PRIMARY KEY,
  course_id   INTEGER      NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  due_date    TIMESTAMPTZ  NOT NULL,
  max_points  INTEGER      NOT NULL DEFAULT 100,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX assignments_course_id_idx ON assignments (course_id);


CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- This line creates an index on the user_id column in the refresh_tokens table,
-- which speeds up queries that search for refresh tokens
-- by user_id (such as when validating or revoking tokens for a specific user).
CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens(user_id);