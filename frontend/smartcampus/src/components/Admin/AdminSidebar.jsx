import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const adminName = user?.name || "Admin User";
  const adminRole = user?.role || "ADMIN";
  const profileImage = user?.imageUrl || user?.avatarUrl || "";
  const adminInitials = adminName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const sideLinks = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/resources", label: "Resources" },
    { to: "/admin/bookings", label: "Bookings", end: true },
    { to: "/tickets/admin", label: "Tickets", end: true },
  ];

  return (
    <aside className="admin-sidebar">
      <div>
        <div className="admin-side-brand">
          <span className="admin-side-brand-dot" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="8" cy="8" r="3.3" />
              <circle cx="18" cy="8" r="3.3" />
              <circle cx="8" cy="18" r="3.3" />
              <circle cx="18" cy="18" r="3.3" />
            </svg>
          </span>
          <strong>VertexOne</strong>
        </div>

        <div className="admin-side-profile">
          <div className="admin-side-avatar" aria-hidden="true">
            {profileImage ? (
              <img src={profileImage} alt="" />
            ) : (
              <span>{adminInitials || "AD"}</span>
            )}
          </div>
          <h3>{adminName}</h3>
          <p>{adminRole}</p>
        </div>

        <p className="admin-side-kicker">Admin Panel</p>
        <h2 className="admin-side-title">Operations</h2>

        <nav className="admin-side-nav" aria-label="Admin sections">
          {sideLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-side-link${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="admin-side-bottom">
        <Link to="/tickets/create" className="admin-side-link support-link">
          Support
        </Link>
        <Link to="/" className="admin-side-link logout-link">
          Logout
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
