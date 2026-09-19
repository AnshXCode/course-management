-- Course price (0 = free)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 0;

CREATE TABLE payments (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id        INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id       INTEGER REFERENCES students(id) ON DELETE SET NULL,
  amount_cents     INTEGER NOT NULL,
  currency         VARCHAR(3) NOT NULL DEFAULT 'usd',
  status           VARCHAR(20) NOT NULL DEFAULT 'pending',
  provider         VARCHAR(20) NOT NULL DEFAULT 'mock',
  idempotency_key  VARCHAR(64) UNIQUE,
  enrollment_id    INTEGER REFERENCES enrollments(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at     TIMESTAMPTZ
);

CREATE INDEX payments_user_id_idx ON payments (user_id);
CREATE INDEX payments_status_idx ON payments (status);