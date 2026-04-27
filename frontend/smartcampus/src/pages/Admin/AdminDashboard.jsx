import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookingError, setBookingError] = useState("");
  const [dashboardWarning, setDashboardWarning] = useState("");

  const links = [
    {
      to: "/admin/bookings",
      title: "Manage Bookings",
      desc: "Review pending requests and update statuses.",
    },
    {
      to: "/bookings/calendar",
      title: "Booking Calendar",
      desc: "Visualize upcoming reservations and availability.",
    },
    // {
    //   to: "/bookings",
    //   title: "Booking List",
    //   desc: "Inspect all booking entries and details.",
    // },
    // {
    //   to: "/create",
    //   title: "Create Manual Booking",
    //   desc: "Add a booking request directly from admin.",
    // },
    {
      to: "/tickets/admin",
      title: "Ticket Analytics",
      desc: "Review ticket status and workload trends.",
    },
    {
      to: "/tickets/create",
      title: "Create Ticket",
      desc: "Log a new incident for maintenance teams.",
    },
    {
      to: "/admin/resources",
      title: "Resource Overview",
      desc: "Track inventory and maintenance readiness.",
    },
  ];

  const sideLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/resources", label: "Resources" },
    { to: "/admin/bookings", label: "Bookings", end: true },
    { to: "/tickets/admin", label: "Tickets" },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      const [bookingsRes, ticketsRes, resourcesRes, usersRes] = await Promise.allSettled([
        API.get("/bookings"),
        API.get("/tickets"),
        API.get("/resources"),
        API.get("/users"),
      ]);

      const warnings = [];

      if (bookingsRes.status === "fulfilled" && Array.isArray(bookingsRes.value.data)) {
        setBookings(bookingsRes.value.data);
        setBookingError("");
      } else {
        setBookings([]);
        setBookingError("Booking data unavailable.");
        warnings.push("Bookings");
      }

      if (ticketsRes.status === "fulfilled" && Array.isArray(ticketsRes.value.data)) {
        setTickets(ticketsRes.value.data);
      } else {
        setTickets([]);
        warnings.push("Tickets");
      }

      if (resourcesRes.status === "fulfilled" && Array.isArray(resourcesRes.value.data)) {
        setResources(resourcesRes.value.data);
      } else {
        setResources([]);
        warnings.push("Resources");
      }

      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data)) {
        setUsers(usersRes.value.data);
      } else {
        setUsers([]);
        warnings.push("Users");
      }

      setDashboardWarning(
        warnings.length ? `${warnings.join(", ")} data could not be loaded right now.` : ""
      );
    };

    fetchDashboardData();
  }, []);

  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const bookingCountByDate = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      const value = booking?.startTime;
      if (!value) return;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    });

    return map;
  }, [bookings]);

  const dashboardStats = useMemo(() => {
    const openTickets = tickets.filter(
      (ticket) => ticket?.status === "OPEN" || ticket?.status === "IN_PROGRESS"
    ).length;
    const activeResources = resources.filter(
      (resource) => String(resource?.status || "").toUpperCase() === "ACTIVE"
    ).length;
    const pendingBookings = bookings.filter((booking) => booking?.status === "PENDING").length;

    return [
      { label: "Booking Requests", value: bookings.length, helper: "Total booking entries" },
      { label: "Open Tickets", value: openTickets, helper: "Open + in progress" },
      { label: "Active Resources", value: activeResources, helper: "Ready for booking" },
      // { label: "Users", value: users.length, helper: "Registered accounts" },
      { label: "Pending Bookings", value: pendingBookings, helper: "Awaiting admin review" },
    ];
  }, [bookings, tickets, resources, users]);

  const weeklyAnalytics = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.push({
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        bookings: 0,
        tickets: 0,
        users: 0,
      });
    }

    const indexMap = new Map(days.map((day, index) => [day.key, index]));

    bookings.forEach((booking) => {
      const date = new Date(booking?.startTime);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const idx = indexMap.get(key);
      if (idx == null) return;
      days[idx].bookings += 1;
    });

    tickets.forEach((ticket) => {
      const date = new Date(ticket?.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const idx = indexMap.get(key);
      if (idx == null) return;
      days[idx].tickets += 1;
    });

    users.forEach((user) => {
      const date = new Date(user?.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const idx = indexMap.get(key);
      if (idx == null) return;
      days[idx].users += 1;
    });

    const series = days.map((day) => ({
      ...day,
      total: day.bookings + day.tickets + day.users,
    }));

    const maxValue = Math.max(...series.map((day) => day.total), 1);
    const chartWidth = 330;
    const chartHeight = 110;
    const step = chartWidth / 6;
    const points = series
      .map((item, index) => {
        const x = index * step;
        const y = chartHeight - (item.total / maxValue) * (chartHeight - 10);
        return `${x},${y}`;
      })
      .join(" ");

    return { series, maxValue, points, chartWidth, chartHeight };
  }, [bookings, tickets, users]);

  const operationalInsights = useMemo(() => {
    const approvedBookings = bookings.filter((booking) => booking?.status === "APPROVED").length;
    const resolvedTickets = tickets.filter(
      (ticket) => ticket?.status === "RESOLVED" || ticket?.status === "CLOSED"
    ).length;
    const activeResources = resources.filter(
      (resource) => String(resource?.status || "").toUpperCase() === "ACTIVE"
    ).length;

    return {
      bookingApprovalRate: bookings.length ? Math.round((approvedBookings / bookings.length) * 100) : 0,
      ticketResolutionRate: tickets.length ? Math.round((resolvedTickets / tickets.length) * 100) : 0,
      resourceAvailabilityRate: resources.length ? Math.round((activeResources / resources.length) * 100) : 0,
    };
  }, [bookings, tickets, resources]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const start = new Date(year, month, 1 - startDay);
    const days = [];

    for (let i = 0; i < 42; i += 1) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      days.push(current);
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
    setSelectedDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
    setSelectedDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  return (
    <section className="admin-layout">
      <AdminSidebar />

      <div className="admin-shell">
        <header className="admin-head">
          <div>
            <p className="admin-kicker">Administration</p>
            <h1>Campus Operations Dashboard</h1>
            <p className="admin-subtitle">
              Monitor booking demand and keep campus resources running smoothly.
            </p>
          </div>
          <Link to="/admin/bookings" className="btn btn-primary">
            Open Booking Queue
          </Link>
        </header>

        <div className="admin-content-grid">
          <div className="admin-main-col">
            <div className="admin-stats">
              {dashboardStats.map((stat) => (
                <article className="admin-stat-card" key={stat.label}>
                  <p>{stat.label}</p>
                  <h2>{stat.value}</h2>
                  <span>{stat.helper}</span>
                </article>
              ))}
            </div>

            <section className="admin-analytics-grid" aria-label="Operational analytics">
              <article className="admin-analytics-card">
                <header className="admin-analytics-head">
                  <div>
                    <p>Analytics</p>
                    <h3>Operations Activity</h3>
                  </div>
                  <span>Last 7 Days</span>
                </header>

                <div className="admin-analytics-bars">
                  {weeklyAnalytics.series.map((item) => (
                    <div key={item.key} className="admin-analytics-col">
                      <span>{item.total}</span>
                      <div className="admin-analytics-track">
                        <div
                          className="admin-analytics-fill"
                          style={{
                            height: `${(item.total / weeklyAnalytics.maxValue) * 100}%`,
                          }}
                        />
                      </div>
                      <strong>{item.label}</strong>
                    </div>
                  ))}
                </div>

                <div className="admin-analytics-line">
                  <svg
                    viewBox={`0 0 ${weeklyAnalytics.chartWidth} ${weeklyAnalytics.chartHeight}`}
                    role="img"
                    aria-label="Operations trend line"
                  >
                    <polyline points={weeklyAnalytics.points} />
                  </svg>
                </div>
              </article>

              <article className="admin-analytics-card admin-analytics-card-side">
                <header className="admin-analytics-head">
                  <div>
                    <p>Insights</p>
                    <h3>Management Snapshot</h3>
                  </div>
                </header>
                <ul className="admin-insight-list">
                  <li>
                    <p>Booking approval rate</p>
                    <strong>{operationalInsights.bookingApprovalRate}%</strong>
                  </li>
                  <li>
                    <p>Ticket resolution rate</p>
                    <strong>{operationalInsights.ticketResolutionRate}%</strong>
                  </li>
                  <li>
                    <p>Resource availability</p>
                    <strong>{operationalInsights.resourceAvailabilityRate}%</strong>
                  </li>
                  <li>
                    <p>Total users</p>
                    <strong>{users.length}</strong>
                  </li>
                </ul>
                {dashboardWarning ? (
                  <p className="admin-insight-warning">{dashboardWarning}</p>
                ) : null}
              </article>
            </section>

            <div className="admin-links" aria-label="Admin quick actions">
              {links.map((item) => (
                <Link key={item.to} to={item.to} className="admin-link-card">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <span>Go to section</span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="admin-aside-col">
            <section className="admin-calendar-card" aria-label="Booking calendar">
              <header className="admin-calendar-head">
                <div className="admin-calendar-title-wrap">
                  <span className="admin-calendar-title-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="16" rx="3" />
                      <path d="M8 3v4M16 3v4M3 10h18" />
                    </svg>
                  </span>
                  <h3>{monthLabel}</h3>
                </div>
                <div className="admin-calendar-nav">
                  <button type="button" onClick={handlePrevMonth} aria-label="Previous month">
                    &#8249;
                  </button>
                  <button type="button" onClick={handleNextMonth} aria-label="Next month">
                    &#8250;
                  </button>
                </div>
              </header>
              {bookingError ? (
                <p className="admin-calendar-error">{bookingError}</p>
              ) : null}
              <div className="admin-calendar-grid">
                <span className="admin-calendar-day">Sun</span>
                <span className="admin-calendar-day">Mon</span>
                <span className="admin-calendar-day">Tue</span>
                <span className="admin-calendar-day">Wed</span>
                <span className="admin-calendar-day">Thu</span>
                <span className="admin-calendar-day">Fri</span>
                <span className="admin-calendar-day">Sat</span>

                {calendarDays.map((date) => {
                  const key = date.toISOString().slice(0, 10);
                  const count = bookingCountByDate.get(key) || 0;
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const isToday =
                    date.getFullYear() === today.getFullYear() &&
                    date.getMonth() === today.getMonth() &&
                    date.getDate() === today.getDate();
                  const isSelected =
                    date.getFullYear() === selectedDate.getFullYear() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getDate() === selectedDate.getDate();

                  const classes = ["admin-calendar-date"];
                  if (!isCurrentMonth) classes.push("is-muted");
                  if (count > 0) classes.push("has-events");
                  if (isToday) classes.push("is-today");
                  if (isSelected) classes.push("is-selected");

                  return (
                    <button
                      key={key}
                      type="button"
                      className={classes.join(" ")}
                      onClick={() => setSelectedDate(new Date(date))}
                      aria-label={`Select ${date.toDateString()}`}
                    >
                      <span>{date.getDate()}</span>
                      {count > 0 ? (
                        <span className="admin-calendar-dot" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
