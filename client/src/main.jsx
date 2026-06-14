import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import NotificationProvider from "./context/NotificationProvider.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient.js";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* QueryClientProvider is used here to wrap our app, so that any component inside 
          (such as those using useQuery, useMutation, etc. from React Query) has access 
          to the QueryClient instance.
          For example, inside components like Courses, Students, or Enrollments in our app,
          React Query hooks (e.g., useQuery) can now access the queryClient provided here. */}
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
 
 
        <NotificationProvider>
          <App />
        </NotificationProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
