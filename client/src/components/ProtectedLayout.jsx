import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/courses", label: "Courses" },
  { to: "/students", label: "Students" },
  { to: "/enrollments", label: "Enrollments" },
  { to: "/logs", label: "Logs", admin: true },
];

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const NAV_ITEMS_AS_PER_PERMISSION = user.role !== 'admin' ? NAV_ITEMS.filter(e => !e.admin) : NAV_ITEMS;

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
          {NAV_ITEMS_AS_PER_PERMISSION.map((item) => (
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
