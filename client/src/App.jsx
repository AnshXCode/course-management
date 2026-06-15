import { Route, Routes } from "react-router-dom";
import Courses from "./components/Courses.jsx";
import Students from "./components/Students.jsx";
import Enrollments from "./components/Enrollments.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import VerifyEmail from "./components/VerifyEmail.jsx";
import ProtectedLayout from "./components/ProtectedLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import Logs from "./components/Logs.jsx"
import RootRedirect from "./components/RootRedirect.jsx";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route path="/verify-email/:verifyToken" element={<VerifyEmail />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/students" element={<Students />} />
          <Route path="/enrollments" element={<Enrollments />} />
          <Route path="/logs" element={<Logs />} />
        </Route>
      </Route>
      <Route path="/" element={<RootRedirect />} />
    </Routes>
  );
}

export default App;
