// Entry point: starts the HTTP server (npm run dev / npm start).
//
// app.js defines the Express app (routes, middleware) and exports it without listening.
// index.js calls app.listen() so the app can be imported elsewhere—e.g. supertest in
// tests—without binding a port or logging "Server running".
//
// Separation of concerns:
//   app.js   → what the API is (configurable, testable)
//   index.js → run the API as a live process

import app from "./app.js";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
