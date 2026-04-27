import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./BookingCalendar.css";

const ACTIVE_STATUSES = new Set(["APPROVED"]);

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const startOfCalendar = (date) => {
  const start = startOfMonth(date);
  const day = start.getDay();
  return addDays(start, -day);
};

const endOfCalendar = (date) => {
  const end = endOfMonth(date);
  const day = end.getDay();
  return addDays(end, 6 - day);
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (date) =>
  date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const normalizeBooking = (booking) => {
  const start = new Date(booking?.startTime);
  const end = new Date(booking?.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return {
    ...booking,
    start,
    end,
  };
};

const isSameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

function BookingCalendar() {
  const colors = {
    primaryDark: "#1A1F5A",
    primaryGradientEnd: "#2A3080",
    textDark: "#1A1F5A",
    textMedium: "#6B7BA4",
    textLight: "#C8D9FF",
    bgLight: "#F7F9FF",
    borderLight: "#E3E9F8",
    white: "#FFFFFF",
    danger: "#DC2626",
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${colors.bgLight} 0%, ${colors.white} 100%)`,
      padding: "32px 20px 60px",
    },
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    hero: {
      background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryGradientEnd} 100%)`,
      borderRadius: "24px",
      padding: "32px",
      color: colors.white,
      marginBottom: "28px",
      boxShadow: "0 18px 40px rgba(26, 31, 90, 0.16)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "14px",
      flexWrap: "wrap",
    },
    heroContent: {
      minWidth: "260px",
      flex: "1 1 620px",
    },
    heroTitle: {
      margin: 0,
      fontSize: "34px",
      fontWeight: "800",
      lineHeight: "1.2",
    },
    heroText: {
      marginTop: "10px",
      marginBottom: 0,
      color: colors.textLight,
      fontSize: "15px",
      lineHeight: "1.7",
      maxWidth: "760px",
    },
    card: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "22px",
      padding: "28px",
      boxShadow: "0 16px 36px rgba(17, 24, 39, 0.06)",
    },
    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "700",
      color: colors.textDark,
    },
    sectionText: {
      marginTop: "8px",
      color: colors.textMedium,
      fontSize: "14px",
      lineHeight: "1.7",
    },
    errorBox: {
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      color: colors.danger,
      padding: "12px 14px",
      borderRadius: "14px",
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: "18px",
    },
  };
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get("/bookings");
        const data = Array.isArray(response.data) ? response.data : [];
        const normalized = data
          .filter((item) => ACTIVE_STATUSES.has(item?.status))
          .map(normalizeBooking)
          .filter(Boolean);
        setBookings(normalized);
      } catch (e) {
        console.error("Error fetching bookings", e);
        setError("Couldn't load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const calendarDays = useMemo(() => {
    const start = startOfCalendar(currentMonth);
    const end = endOfCalendar(currentMonth);
    const days = [];

    for (let day = new Date(start); day <= end; day = addDays(day, 1)) {
      days.push(new Date(day));
    }

    return days;
  }, [currentMonth]);

  const bookingsByDate = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      const key = formatDateKey(booking.start);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(booking);
    });
    
    // Sort bookings by start time for each date
    map.forEach((bookingsForDate) => {
      bookingsForDate.sort((a, b) => a.start - b.start);
    });
    
    return map;
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((booking) => booking.end >= now)
      .sort((a, b) => a.start - b.start)
      .slice(0, 6);
  }, [bookings]);

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>Booking Calendar</h1>
            <p style={styles.heroText}>
              Explore active bookings across the month. Hover to preview or click
              events to view more details.
            </p>
          </div>

          <Link to="/create" className="calendar-book-now-btn">
            Book Now
          </Link>
        </div>

        <div style={styles.card} className="booking-calendar">
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.sectionTitle}>Calendar View</h2>
              <p style={styles.sectionText}>
                Hover a booking to preview details, click to view more.
              </p>
            </div>

            <div className="calendar-top-actions">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setCurrentMonth(addDays(startOfMonth(currentMonth), -1))}
              >
                Prev
              </button>
              <span className="fw-semibold">{monthLabel}</span>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setCurrentMonth(addDays(endOfMonth(currentMonth), 1))}
              >
                Next
              </button>
            </div>
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {loading ? <div className="text-muted">Loading calendar...</div> : null}

          <div className="calendar-layout">
            <aside className="calendar-side">
              <div className="side-header">
                <h3 className="h5 mb-1">Upcoming Events</h3>
                <span className="text-muted small">Don't miss schedule</span>
              </div>

              <div className="side-list">
                {upcomingBookings.length === 0 ? (
                  <div className="text-muted">No upcoming bookings yet.</div>
                ) : (
                  upcomingBookings.map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      className="event-card"
                      onClick={() => setActiveBooking(booking)}
                    >
                      <div className="event-row">
                        <span className="event-dot" />
                        <span className="event-time">
                          {booking.start.toLocaleDateString()} - {formatTime(booking.start)} -
                          {formatTime(booking.end)}
                        </span>
                      </div>
                      <div className="event-title">{booking.resourceName}</div>
                      <div className="event-subtitle">
                        {booking.purpose || "Campus booking"} - {booking.bookedBy || "N/A"}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="calendar-main">
              <div className="calendar-controls">
                <span className="calendar-pill">Month</span>
              </div>

              <div className="calendar-weekdays">
                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarDays.map((day) => {
                  const key = formatDateKey(day);
                  const isCurrent = isSameMonth(day, currentMonth);
                  const dayBookings = bookingsByDate.get(key) ?? [];
                  const hasBookings = dayBookings.length > 0;

                  return (
                    <div
                      key={key}
                      className={`calendar-day${isCurrent ? "" : " muted"}${
                        hasBookings ? " booked" : " free"
                      }`}
                    >
                      <div className="calendar-day-top">
                        <span className="calendar-date">{day.getDate()}</span>
                      </div>
                      <div className="calendar-events">
                        {dayBookings.slice(0, 4).map((booking) => (
                          <button
                            key={booking.id}
                            type="button"
                            className="calendar-event"
                            onClick={() => setActiveBooking(booking)}
                          >
                            <span className="event-time">
                              {formatTime(booking.start)}
                            </span>
                            <span className="event-title">
                              {booking.resourceName}
                            </span>
                            <span className="event-tooltip">
                              {booking.resourceName} - {booking.purpose || "Booking"}
                              <br />
                              Booked by: {booking.bookedBy || "N/A"}
                              <br />
                              {formatTime(booking.start)} - {formatTime(booking.end)}
                            </span>
                          </button>
                        ))}
                        {dayBookings.length > 4 ? (
                          <button
                            type="button"
                            className="event-more-btn"
                            onClick={() => setActiveBooking({ __isViewAll: true, date: key, bookings: dayBookings })}
                          >
                            +{dayBookings.length - 4} more
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {activeBooking ? (
          <div className="calendar-modal" role="dialog" aria-modal="true">
            <div className="calendar-modal-card">
              <div className="calendar-modal-header">
                <h4 className="h5 mb-0">Booking Details</h4>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setActiveBooking(null)}
                >
                  Close
                </button>
              </div>
              <div className="calendar-modal-body">
                <div className="detail-row">
                  <span className="detail-label">Resource</span>
                  <span>{activeBooking.resourceName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Purpose</span>
                  <span>{activeBooking.purpose}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Booked By</span>
                  <span>{activeBooking.bookedBy || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Attendees</span>
                  <span>{activeBooking.attendees}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span>{activeBooking.status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time</span>
                  <span>
                    {formatTime(activeBooking.start)} - {formatTime(activeBooking.end)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default BookingCalendar;
