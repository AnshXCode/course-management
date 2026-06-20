import pg from "pg";
import dotenv from "dotenv";

// This file sets up and exports a PostgreSQL connection pool using environment variables.
// We use dotenv to load configuration variables (like the database URL) from a .env file into process.env.
// Then, we import Pool from the pg library and initialize a new connection pool with the DATABASE_URL from environment variables.
// Exporting the pool instance lets other parts of the server easily connect to the database.

dotenv.config();

// Why a pool? Reuses connections instead of opening one per request.
const {Pool} = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Neon (and other hosted Postgres) can drop idle connections; without this
// listener, pg-pool emits an unhandled 'error' event and Node exits.
pool.on("error", (err) => {
    console.error("Unexpected error on idle database client", err.message);
});

export default pool;