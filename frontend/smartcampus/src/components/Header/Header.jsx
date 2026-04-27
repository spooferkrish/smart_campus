import "./Header.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, getRoleDashboardPath } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  const roleLabel = user?.role === "USER" ? "Student" : user?.role;
  const showDashboard = isAuthenticated && user?.role && user.role !== "USER";
  const isAdmin = user?.role === "ADMIN";
  const isTechnician = user?.role === "TECHNICIAN";

  const handleLogout = async () => {
    closeMenu();
    await logout();
  };

  const navLinkClass = ({ isActive }) =>
    `header-link${isActive ? " active" : ""}`;

  return (
    <header className="header-shell">
      <div className="sc-container header-row">
        <NavLink to="/" className="header-brand" onClick={closeMenu}>
          VertexOne
        </NavLink>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        <nav className={`header-nav${menuOpen ? " open" : ""}`}>
          {isAuthenticated ? (
            <>
              <div className="header-mega">
                <NavLink
                  to={isAdmin ? "/admin/resources" : "/resources"}
                  className={`${navLinkClass({ isActive: false })} header-mega-trigger`}
                  onClick={closeMenu}
                >
                  Resources
                  <span className="header-caret" aria-hidden="true">▾</span>
                </NavLink>
                <div className="header-mega-panel">
                  <div className="header-mega-card">
                    <p className="header-mega-kicker">Campus assets</p>
                    <h4>{isAdmin ? "Resource Control" : "Resource Directory"}</h4>
                    <p>
                      {isAdmin
                        ? "Manage campus inventory, availability, and maintenance status."
                        : "Browse available facilities, labs, and shared equipment."}
                    </p>
                    <NavLink
                      to={isAdmin ? "/admin/resources" : "/resources"}
                      className="header-mega-cta"
                      onClick={closeMenu}
                    >
                      {isAdmin ? "Manage Resources" : "Open Resources"}
                    </NavLink>
                  </div>
                  <div className="header-mega-links">
                    <span className="header-mega-label">Quick Links</span>
                    <NavLink to={isAdmin ? "/admin/resources" : "/resources"} onClick={closeMenu}>
                      {isAdmin ? "Resource Inventory" : "Resource List"}
                    </NavLink>
                    {isAdmin && (
                      <NavLink to="/admin/resources" onClick={closeMenu}>Manage Resources</NavLink>
                    )}
                    {!isAdmin && (
                      <NavLink to="/bookings/calendar" onClick={closeMenu}>Booking Calendar</NavLink>
                    )}
                  </div>
                </div>
              </div>

              <div className="header-mega">
                <NavLink
                  to={isAdmin ? "/admin/bookings" : "/bookings"}
                  className={`${navLinkClass({ isActive: false })} header-mega-trigger`}
                  onClick={closeMenu}
                >
                  Bookings
                  <span className="header-caret" aria-hidden="true">▾</span>
                </NavLink>
                <div className="header-mega-panel">
                  <div className="header-mega-card">
                    <p className="header-mega-kicker">Scheduling</p>
                    <h4>{isAdmin ? "Booking Queue" : "Reservation Hub"}</h4>
                    <p>
                      {isAdmin
                        ? "Review incoming booking requests and keep the queue moving."
                        : "Track upcoming reservations and create new booking requests."}
                    </p>
                    <NavLink
                      to={isAdmin ? "/admin/bookings" : "/bookings"}
                      className="header-mega-cta"
                      onClick={closeMenu}
                    >
                      {isAdmin ? "Open Booking Queue" : "View My Bookings"}
                    </NavLink>
                  </div>
                  <div className="header-mega-links">
                    <span className="header-mega-label">Quick Links</span>
                    {isAdmin ? (
                      <>
                        <NavLink to="/admin/bookings" onClick={closeMenu}>Booking Queue</NavLink>
                        <NavLink to="/bookings/calendar" onClick={closeMenu}>Booking Calendar</NavLink>
                      </>
                    ) : (
                      <>
                        <NavLink to="/bookings" onClick={closeMenu}>My Bookings</NavLink>
                        <NavLink to="/create" onClick={closeMenu}>New Booking</NavLink>
                        <NavLink to="/bookings/calendar" onClick={closeMenu}>Booking Calendar</NavLink>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="header-mega">
                <NavLink
                  to={isAdmin ? "/tickets/admin" : "/tickets/my"}
                  className={`${navLinkClass({ isActive: false })} header-mega-trigger`}
                  onClick={closeMenu}
                >
                  Tickets
                  <span className="header-caret" aria-hidden="true">▾</span>
                </NavLink>
                <div className="header-mega-panel">
                  <div className="header-mega-card">
                    <p className="header-mega-kicker">Support</p>
                    <h4>{isAdmin ? "Service Queue" : "Issue Desk"}</h4>
                    <p>
                      {isAdmin
                        ? "Monitor ticket pipeline, assign support, and resolve incidents."
                        : "Report campus issues, track progress, and collaborate with support."}
                    </p>
                    <NavLink
                      to={isAdmin ? "/tickets/admin" : "/tickets/my"}
                      className="header-mega-cta"
                      onClick={closeMenu}
                    >
                      {isAdmin ? "Open Ticket Queue" : "View My Tickets"}
                    </NavLink>
                  </div>
                  <div className="header-mega-links">
                    <span className="header-mega-label">Quick Links</span>
                    {isAdmin ? (
                      <>
                        <NavLink to="/tickets/admin" onClick={closeMenu}>Admin Tickets</NavLink>
                        <NavLink to="/tickets/technician" onClick={closeMenu}>Technician Queue</NavLink>
                      </>
                    ) : (
                      <>
                        <NavLink to="/tickets/my" onClick={closeMenu}>My Tickets</NavLink>
                        <NavLink to="/tickets/create" onClick={closeMenu}>New Ticket</NavLink>
                        {isTechnician && (
                          <NavLink to="/tickets/technician" onClick={closeMenu}>Technician Queue</NavLink>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="header-mega">
                  <NavLink
                    to="/admin"
                    className={`${navLinkClass({ isActive: false })} header-mega-trigger`}
                    onClick={closeMenu}
                  >
                    Admin
                    <span className="header-caret" aria-hidden="true">▾</span>
                  </NavLink>
                  <div className="header-mega-panel">
                    <div className="header-mega-card">
                      <p className="header-mega-kicker">Operations</p>
                      <h4>Admin Console</h4>
                      <p>Oversee bookings, resources, and campus operations.</p>
                      <NavLink to="/admin" className="header-mega-cta" onClick={closeMenu}>
                        Open Admin Dashboard
                      </NavLink>
                    </div>
                    <div className="header-mega-links">
                      <span className="header-mega-label">Quick Links</span>
                      <NavLink to="/admin" onClick={closeMenu}>Admin Dashboard</NavLink>
                      <NavLink to="/admin/resources" onClick={closeMenu}>Manage Resources</NavLink>
                    </div>
                  </div>
                </div>
              )}

              <NavLink
                to="/notifications"
                className={navLinkClass}
                onClick={closeMenu}
              >
                Notifications
              </NavLink>
              <NavLink
                to="/account/settings"
                className={navLinkClass}
                onClick={closeMenu}
              >
                Account
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass} onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navLinkClass} onClick={closeMenu}>
                Signup
              </NavLink>
            </>
          )}
        </nav>

        {isAuthenticated && (
          <div className="header-auth-rail">
            <NotificationBell />
            <div className="header-user-meta">
              <span className="header-user-name">{user?.name || "User"}</span>
              <span className="header-user-role">{roleLabel}</span>
            </div>
            <button
              className="header-logout-icon"
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
