# Course Management System

A full-stack web app for managing courses, students, and enrollments. Built with **React**, **Node.js (Express)**, and **PostgreSQL**.

## Features

- **Courses** — create, list, update, delete; view enrolled students per course
- **Students** — create, list, update, delete
- **Enrollments** — enroll a student in a course, list all enrollments, unenroll

## Tech stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite                      |
| Backend  | Node.js, Express 5 (ES modules)     |
| Database | PostgreSQL (`pg` connection pool)   |

## Project structure

```text
course-management/
├── client/                 # React app (Vite)
│   ├── src/
│   │   ├── api/config.js   # API base URL and endpoints
│   │   ├── components/     # Courses, Students, Enrollments
│   │   └── App.jsx
│   └── package.json
├── server/                 # Express API
│   ├── db/
│   │   ├── pool.js         # Postgres connection pool
│   │   └── schema.sql      # Database schema (CREATE TABLE)
│   ├── routes/             # courses, students, enrollments
│   ├── app.js
│   ├── index.js
│   └── package.json
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (e.g. via Homebrew on macOS)
- npm

### macOS: install PostgreSQL with Homebrew

```bash
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

On Intel Macs, the path may be `/usr/local/opt/postgresql@16/bin`.

## Database setup

1. Create the database:

```bash
createdb course_management
```

2. Apply the schema:

```bash
psql course_management -f server/db/schema.sql
```

3. Verify (optional):

```bash
psql course_management -c "\dt"
```

## Server setup

1. Install dependencies:

```bash
cd server
npm install
```

2. Create `server/.env`:

```env
PORT=5001
DATABASE_URL=postgresql://YOUR_MAC_USERNAME@localhost:5432/course_management
```

Replace `YOUR_MAC_USERNAME` with the output of `whoami`. Add a password to the URL if your Postgres user requires one.

> **Note:** On macOS, port **5000** is often used by AirPlay. This project uses **5001** by default.

3. Start the API:

```bash
npm run dev
```

API runs at **http://localhost:5001**

Health check: `curl http://localhost:5001/api/health`

## Client setup

In a **second terminal**:

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

The client calls the API at `http://localhost:5001/api` (see `client/src/api/config.js`).

## Running the app

You need **three things** running:

1. PostgreSQL (`brew services start postgresql@16` or Postgres.app)
2. Server — `cd server && npm run dev`
3. Client — `cd client && npm run dev`

## API overview

Base URL: `http://localhost:5001/api`

### Courses

| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/courses`              | List all courses         |
| POST   | `/courses`              | Create course            |
| GET    | `/courses/:id`          | Get one course           |
| PUT    | `/courses/:id`          | Update course            |
| DELETE | `/courses/:id`          | Delete course            |
| GET    | `/courses/:id/students` | Students enrolled in course |

### Students

| Method | Path           | Description       |
|--------|----------------|-------------------|
| GET    | `/students`    | List all students |
| POST   | `/students`    | Create student    |
| PUT    | `/students/:id`| Update student    |
| DELETE | `/students/:id`| Delete student    |

### Enrollments

| Method | Path              | Description                    |
|--------|-------------------|--------------------------------|
| GET    | `/enrollments`    | List all enrollments           |
| POST   | `/enrollments`    | Enroll student in course       |
| DELETE | `/enrollments/:id`| Remove enrollment              |

**POST /enrollments** body (JSON):

```json
{
  "studentId": 1,
  "courseId": 3,
  "studentName": "alice",
  "courseName": "Intro to Programming"
}
```

`studentId` and `courseId` are required. Names are stored for display in the enrollments list.

## Environment variables

| Variable       | Location      | Example                                              |
|----------------|---------------|------------------------------------------------------|
| `PORT`         | `server/.env` | `5001`                                               |
| `DATABASE_URL` | `server/.env` | `postgresql://user@localhost:5432/course_management` |

Do not commit `server/.env` (it is listed in `server/.gitignore`).

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for deploying to Render + Vercel with Neon Postgres.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED` on API calls | Start the server (`npm run dev` in `server/`) |
| `connection refused` to Postgres | `brew services start postgresql@16` |
| Port 5000 / 403 Forbidden | Use port **5001** in `.env` (macOS AirPlay uses 5000) |
| `database does not exist` | Run `createdb course_management` |
| CORS errors | Server uses `cors()` — ensure API URL in `config.js` matches server port |

## License

ISC
