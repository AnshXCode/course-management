import dotenv from 'dotenv';




// Loads environment variables from a .env file into process.env
// dotenv.config() loads environment variables from a .env file into process.env *at runtime*.
// This is necessary in local development or when running Node.js directly,
// because process.env may *not* be pre-filled unless your process manager or deployment platform
// parses and injects .env variables for you. In production (e.g., on some managed hosts),
// environment variables may already be set and dotenv isn't strictly required.
// However, including it ensures local/dev envs work seamlessly.
dotenv.config();