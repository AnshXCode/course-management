import pool from "../db/pool.js";
import fs from "fs";

const sql = fs.readFileSync("db/migrations/001_refresh_tokens.sql", "utf8")
await pool.query(sql);
await pool.end();