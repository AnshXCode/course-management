import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

const NAV_ITEMS = [
  { to: "/courses", label: "Courses" },
  { to: "/students", label: "Students" },
  { to: "/enrollments", label: "Enrollments" },
];

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Course Manager</h1>
          <p className="sidebar-subtitle">
            {user?.email ? `${user.email} (${user.role})` : "Admin panel"}
          </p>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
