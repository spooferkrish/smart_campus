import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import "./BookingAdmin.css";
import "../Admin/AdminDashboard.css";

const getResourceApiCandidates = () => {
  const baseURL = (API?.defaults?.baseURL ?? "").replace(/\/+$/, "");
  const nonApiBase = baseURL.replace(/\/api$/i, "");
  const candidates = ["/resources"];

  if (nonApiBase) {
    candidates.push(`${nonApiBase}/resources`);
  }

  return [...new Set(candidates)];
};

const normalizeName = (value) => (value ?? "").trim().toLowerCase();

function BookingAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [slotFilter, setSlotFilter] = useState("ALL");
  const [capacityFilter, setCapacityFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [allBookings, setAllBookings] = useState([]);
  const [resourceCapacityMap, setResourceCapacityMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resourceError, setResourceError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: "",
    bookingId: null,
    message: "",
  });
  const [viewModal, setViewModal] = useState({
    show: false,
    booking: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [page, setPage] = useState(1);

  const bookingRegistryRef = useRef(null);
  const pageSize = 5;

  useEffect(() => {
    fetchBookings();
    fetchResources();
  }, []);

  useEffect(() => {
    if (!toast.show) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, slotFilter, capacityFilter, resourceFilter]);

  const getCapacity = (name) => {
    const key = normalizeName(name);
    return resourceCapacityMap[key] ?? null;
  };

  const exceedsCapacity = (booking) => {
    const cap = getCapacity(booking?.resourceName);
    if (cap == null) return false;
    return Number(booking?.attendees) > Number(cap);
  };

  const getTimeSlot = (value) => {
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return "OTHER";

    const hour = dateObj.getHours();
    if (hour < 12) return "MORNING";
    if (hour < 17) return "AFTERNOON";
    return "EVENING";
  };

  const matchCapacityFilter = (booking) => {
    const attendeeCount = Number(booking?.attendees);
    if (Number.isNaN(attendeeCount)) return capacityFilter === "ALL";

    if (capacityFilter === "SMALL") return attendeeCount <= 20;
    if (capacityFilter === "MEDIUM") return attendeeCount > 20 && attendeeCount <= 50;
    if (capacityFilter === "LARGE") return attendeeCount > 50;
    return true;
  };

  const filteredBookings = useMemo(() => {
    const search = (searchQuery ?? "").trim().toLowerCase();

    return allBookings.filter((booking) => {
      const resourceName = ((booking?.resourceName ?? "") + "").trim().toLowerCase();
      const purpose = ((booking?.purpose ?? "") + "").trim().toLowerCase();
      const requester = ((booking?.bookedBy ?? "") + "").trim().toLowerCase();

      const resourceOk = resourceFilter === "ALL" ? true : booking?.resourceName === resourceFilter;
      const statusOk = statusFilter === "ALL" ? true : booking?.status === statusFilter;
      const slotOk = slotFilter === "ALL" ? true : getTimeSlot(booking?.startTime) === slotFilter;
      const capacityOk = matchCapacityFilter(booking);
      const searchOk = !search
        ? true
        :
            resourceName.includes(search) ||
            purpose.includes(search) ||
            requester.includes(search) ||
            String(booking?.id ?? "").includes(search);

      return resourceOk && statusOk && slotOk && capacityOk && searchOk;
    });
  }, [allBookings, searchQuery, statusFilter, slotFilter, capacityFilter, resourceFilter]);

  const bookingStats = useMemo(() => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();

    const approvedToday = allBookings.filter((booking) => {
      if (booking?.status !== "APPROVED") return false;
      const startDate = new Date(booking?.startTime);
      if (Number.isNaN(startDate.getTime())) return false;

      return (
        startDate.getDate() === day &&
        startDate.getMonth() === month &&
        startDate.getFullYear() === year
      );
    }).length;

    return {
      total: allBookings.length,
      pending: allBookings.filter((booking) => booking?.status === "PENDING").length,
      approvedToday,
      activeResources: new Set(
        allBookings
          .map((booking) => booking?.resourceName)
          .filter((resourceName) => Boolean(resourceName))
      ).size,
    };
  }, [allBookings]);

  const weeklyActivity = useMemo(() => {
    const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const values = new Array(7).fill(0);

    allBookings.forEach((booking) => {
      const dateObj = new Date(booking?.startTime);
      if (Number.isNaN(dateObj.getTime())) return;
      values[dateObj.getDay()] += 1;
    });

    return weekdayLabels.map((label, index) => ({
      label,
      value: values[index],
    }));
  }, [allBookings]);

  const activityMeta = useMemo(() => {
    const maxValue = Math.max(...weeklyActivity.map((item) => item.value), 1);
    const total = weeklyActivity.reduce((sum, item) => sum + item.value, 0);
    const average = Math.round((total / 7) * 10) / 10;
    const peak = weeklyActivity.reduce(
      (prev, current) => (current.value > prev.value ? current : prev),
      weeklyActivity[0] || { label: "Su", value: 0 }
    );

    const chartWidth = 360;
    const chartHeight = 140;
    const step = chartWidth / 6;
    const points = weeklyActivity
      .map((item, index) => {
        const x = index * step;
        const y = chartHeight - (item.value / maxValue) * (chartHeight - 20);
        return `${x},${y}`;
      })
      .join(" ");

    return { maxValue, average, peak, points, chartWidth, chartHeight };
  }, [weeklyActivity]);

  const approvalRate = useMemo(() => {
    if (!allBookings.length) return 0;
    const approved = allBookings.filter((booking) => booking?.status === "APPROVED").length;
    return Math.round((approved / allBookings.length) * 100);
  }, [allBookings]);

  const resourceOptions = useMemo(() => {
    const set = new Set(
      allBookings
        .map((booking) => booking?.resourceName)
        .filter((resourceName) => Boolean(resourceName))
    );

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allBookings]);

  const pageCount = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageRows = filteredBookings.slice(startIndex, startIndex + pageSize);

  const fetchResources = async () => {
    setResourceError("");

    const endpoints = getResourceApiCandidates();

    for (const endpoint of endpoints) {
      try {
        const response = await API.get(endpoint);

        if (!Array.isArray(response.data)) {
          continue;
        }

        const map = {};

        response.data.forEach((resource) => {
          const key = normalizeName(resource?.name);
          if (!key) return;
          map[key] = resource?.capacity ?? null;
        });

        setResourceCapacityMap(map);
        return;
      } catch {
        // Try next endpoint candidate.
      }
    }

    setResourceCapacityMap({});
    setResourceError("Couldn't load resource capacities.");
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/bookings");
      setAllBookings(response.data);
    } catch (e) {
      console.error("Error fetching bookings", e);
      setError("Couldn't load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openConfirm = (type, id, presetReason = "") => {
    const messageMap = {
      approve: "Approve this booking?",
      reject: "Reject this booking?",
      cancel: "Cancel this booking?",
    };

    setRejectReason(presetReason);
    setConfirmDialog({
      show: true,
      type,
      bookingId: id,
      message: messageMap[type] || "Confirm this action?",
    });
  };

  const closeConfirm = () => {
    setConfirmDialog({ show: false, type: "", bookingId: null, message: "" });
    setRejectReason("");
  };

  const runConfirmAction = async () => {
    const { type, bookingId } = confirmDialog;

    if (!type || !bookingId) {
      closeConfirm();
      return;
    }

    if (type === "reject" && !rejectReason.trim()) {
      setToast({ show: true, message: "Reason is required.", type: "error" });
      return;
    }

    closeConfirm();

    try {
      if (type === "approve") {
        await API.put(`/bookings/${bookingId}/approve`);
        setToast({ show: true, message: "Booking approved.", type: "success" });
      } else if (type === "reject") {
        await API.put(`/bookings/${bookingId}/reject`, { reason: rejectReason.trim() });
        setToast({ show: true, message: "Booking rejected.", type: "success" });
      } else if (type === "cancel") {
        await API.put(`/bookings/${bookingId}/cancel`);
        setToast({ show: true, message: "Booking cancelled.", type: "success" });
      }

      fetchBookings();
    } catch (e) {
      console.error(e);
      setToast({ show: true, message: "Action failed. Please try again.", type: "error" });
    }
  };

  const approveBooking = (id) => openConfirm("approve", id);
  const rejectBooking = (id, presetReason = "") => openConfirm("reject", id, presetReason);
  const cancelBooking = (id) => openConfirm("cancel", id);

  const formatDateTime = (value) => {
    if (!value) return { date: "-", time: "-" };

    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) {
      return { date: value?.substring(0, 10) || "-", time: "-" };
    }

    const date = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { date, time };
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const jumpToRegistry = () => {
    bookingRegistryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleView = (booking) => {
    setViewModal({ show: true, booking });
  };

  const closeViewModal = () => {
    setViewModal({ show: false, booking: null });
  };

  return (
    <div className="booking-admin-page admin-layout">
      <AdminSidebar />

      <div className="booking-admin-shell">
          {toast.show ? (
            <div
              className={`booking-toast ${toast.type === "error" ? "error" : "success"}`}
              role="status"
              aria-live="polite"
            >
              {toast.message}
            </div>
          ) : null}

          <section className="booking-hero">
            <div>
              <p className="booking-hero-eyebrow">Administration</p>
              <h1>Campus Operations Dashboard</h1>
              <p className="booking-hero-text">
                Monitor booking demand and keep campus resources running smoothly.
              </p>
            </div>
            <button type="button" className="booking-hero-action" onClick={jumpToRegistry}>
              Open Booking Queue
            </button>
          </section>

          <section className="booking-stats-grid">
            <article className="booking-stat-card">
              <p>Total Bookings</p>
              <h3>{bookingStats.total}</h3>
              <span>All booking requests</span>
            </article>
            <article className="booking-stat-card">
              <p>Pending</p>
              <h3>{bookingStats.pending}</h3>
              <span>Waiting for review</span>
            </article>
            <article className="booking-stat-card">
              <p>Approved Today</p>
              <h3>{bookingStats.approvedToday}</h3>
              <span>Completed approvals</span>
            </article>
            <article className="booking-stat-card">
              <p>Active Resources</p>
              <h3>{bookingStats.activeResources}</h3>
              <span>Bookable campus resources</span>
            </article>
          </section>

          <section className="booking-analytics-grid">
            <article className="booking-analytics-card">
              <header className="booking-analytics-head">
                <h3>Hours Activity</h3>
                <span>Weekly</span>
              </header>

              <div className="booking-activity-bars" aria-label="Weekly booking activity chart">
                {weeklyActivity.map((item) => (
                  <div key={item.label} className="booking-activity-col">
                    <span className="booking-activity-value">{item.value}</span>
                    <div className="booking-activity-track">
                      <div
                        className="booking-activity-fill"
                        style={{ height: `${(item.value / activityMeta.maxValue) * 100}%` }}
                      />
                    </div>
                    <strong>{item.label}</strong>
                  </div>
                ))}
              </div>

              <div className="booking-activity-line-wrap">
                <svg
                  viewBox={`0 0 ${activityMeta.chartWidth} ${activityMeta.chartHeight}`}
                  role="img"
                  aria-label="Weekly activity trend line"
                >
                  <polyline points={activityMeta.points} />
                </svg>
              </div>
            </article>

            <article className="booking-analytics-card booking-analytics-side">
              <header className="booking-analytics-head">
                <h3>Analytics Summary</h3>
                <span>Live</span>
              </header>

              <ul className="booking-insights-list">
                <li>
                  <p>Peak day</p>
                  <strong>
                    {activityMeta.peak.label} ({activityMeta.peak.value} bookings)
                  </strong>
                </li>
                <li>
                  <p>Daily average</p>
                  <strong>{activityMeta.average} bookings/day</strong>
                </li>
                <li>
                  <p>Approval rate</p>
                  <strong>{approvalRate}%</strong>
                </li>
                <li>
                  <p>Pending queue</p>
                  <strong>{bookingStats.pending} requests</strong>
                </li>
              </ul>
            </article>
          </section>

          <section className="booking-filters">
            <div className="booking-field search">
              <label htmlFor="booking-search">Global Search</label>
              <div className="booking-search-input">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M21 21L16.65 16.65M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="booking-search"
                  type="search"
                  placeholder="Search resources, serial numbers, or tags..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>

            <div className="booking-field">
              <label htmlFor="booking-status">Type</label>
              <select
                id="booking-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="booking-field">
              <label htmlFor="booking-time-slot">Category</label>
              <select
                id="booking-time-slot"
                value={slotFilter}
                onChange={(event) => setSlotFilter(event.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="MORNING">Morning</option>
                <option value="AFTERNOON">Afternoon</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>

            <div className="booking-field">
              <label htmlFor="booking-capacity">Capacity</label>
              <select
                id="booking-capacity"
                value={capacityFilter}
                onChange={(event) => setCapacityFilter(event.target.value)}
              >
                <option value="ALL">Any Size</option>
                <option value="SMALL">Up to 20</option>
                <option value="MEDIUM">21 - 50</option>
                <option value="LARGE">Above 50</option>
              </select>
            </div>

            <div className="booking-field">
              <label htmlFor="booking-resource">Location</label>
              <select
                id="booking-resource"
                value={resourceFilter}
                onChange={(event) => setResourceFilter(event.target.value)}
              >
                <option value="ALL">All Blocks</option>
                {resourceOptions.map((resourceName) => (
                  <option key={resourceName} value={resourceName}>
                    {resourceName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="booking-filter-button"
              onClick={() => {
                setPage(1);
                fetchBookings();
                fetchResources();
              }}
              aria-label="Apply filters"
              title="Apply filters"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 6H20M7 12H17M10 18H14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </section>

          {error ? <div className="booking-error-box">{error}</div> : null}
          {resourceError ? <div className="booking-error-box">{resourceError}</div> : null}

          <section ref={bookingRegistryRef} className="booking-registry-card">
            <header className="booking-registry-header">
              <h2>Booking Registry</h2>
              <p>
                Showing {filteredBookings.length === 0 ? 0 : startIndex + 1}-
                {Math.min(startIndex + pageRows.length, filteredBookings.length)} of {" "}
                {filteredBookings.length} bookings
              </p>
            </header>

            <div className="booking-registry-table-wrap">
              <table className="booking-registry-table">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Requested By</th>
                    <th>Schedule</th>
                    <th>Attendees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="booking-empty-state">Loading...</div>
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="booking-empty-state">No matching results.</div>
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((booking) => {
                      const start = formatDateTime(booking?.startTime);
                      const end = formatDateTime(booking?.endTime);
                      const capacity = getCapacity(booking?.resourceName);
                      const isOverLimit = exceedsCapacity(booking);

                      return (
                        <tr key={booking.id}>
                          <td>
                            <div className="booking-main-cell">
                              <strong>{booking.resourceName || "-"}</strong>
                              <span>ID: BKG-{String(booking.id).padStart(3, "0")}</span>
                            </div>
                          </td>
                          <td>
                            <div className="booking-sub-cell">
                              <strong>{booking.bookedBy || "-"}</strong>
                              <span>{booking.purpose || "General request"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="booking-sub-cell">
                              <strong>
                                {start.date} {start.time}
                              </strong>
                              <span>
                                Ends {end.date} {end.time}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="booking-sub-cell">
                              <strong>
                                {booking.attendees ?? "-"}
                                {capacity != null ? ` / ${capacity}` : " / N/A"}
                              </strong>
                              <span>{isOverLimit ? "Above capacity" : "Within capacity"}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`booking-status-pill ${booking.status?.toLowerCase()}`}>
                              {formatStatus(booking.status)}
                            </span>
                          </td>
                          <td>
                            <div className="booking-actions">
                              <button
                                type="button"
                                className="icon-btn"
                                title="View booking"
                                onClick={() => handleView(booking)}
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path
                                    d="M2 12S5.5 5 12 5s10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  />
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  />
                                </svg>
                              </button>

                              {booking.status === "PENDING" ? (
                                <>
                                  <button
                                    type="button"
                                    className="icon-btn approve"
                                    title="Approve booking"
                                    onClick={() => approveBooking(booking.id)}
                                  >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                      <path
                                        d="M5 13.5 9.2 18 19 7.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="icon-btn reject"
                                    title="Reject booking"
                                    onClick={() =>
                                      rejectBooking(
                                        booking.id,
                                        isOverLimit ? "Attendees limit exceeded" : ""
                                      )
                                    }
                                  >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                      <path
                                        d="M18 6 6 18M6 6l12 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                  </button>
                                </>
                              ) : null}

                              {booking.status === "APPROVED" ? (
                                <button
                                  type="button"
                                  className="icon-btn cancel"
                                  title="Cancel booking"
                                  onClick={() => cancelBooking(booking.id)}
                                >
                                  <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <rect
                                      x="6"
                                      y="6"
                                      width="12"
                                      height="12"
                                      rx="2"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                  </svg>
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <footer className="booking-registry-footer">
              <span>Showing {pageSize} per page</span>
              <div className="booking-pagination">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                >
                  {"<"}
                </button>
                <span>{page}</span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                  disabled={page >= pageCount}
                >
                  {">"}
                </button>
              </div>
            </footer>
          </section>
      </div>

      {confirmDialog.show ? (
        <div className="booking-confirm-backdrop" role="presentation" onClick={closeConfirm}>
          <section
            className="booking-confirm-card"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm booking action"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Confirm action</h3>
            <p>{confirmDialog.message}</p>
            {confirmDialog.type === "reject" ? (
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Add a rejection reason"
              />
            ) : null}
            <div className="booking-confirm-actions">
              <button type="button" className="ghost" onClick={closeConfirm}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={runConfirmAction}>
                Confirm
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {viewModal.show && viewModal.booking ? (
        <div className="booking-confirm-backdrop" role="presentation" onClick={closeViewModal}>
          <section
            className="booking-confirm-card"
            role="dialog"
            aria-modal="true"
            aria-label="Booking details"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="booking-details-header">
              <h3>Booking #{viewModal.booking?.id ?? "-"}</h3>
              <button
                type="button"
                className="booking-details-close"
                onClick={closeViewModal}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>
            <div className="booking-details-grid">
              <div className="booking-detail-row">
                <span className="booking-detail-label">Resource</span>
                <span className="booking-detail-value">{viewModal.booking?.resourceName ?? "-"}</span>
              </div>
              <div className="booking-detail-row">
                <span className="booking-detail-label">Requested By</span>
                <span className="booking-detail-value">{viewModal.booking?.bookedBy ?? "-"}</span>
              </div>
              <div className="booking-detail-row">
                <span className="booking-detail-label">Purpose</span>
                <span className="booking-detail-value">{viewModal.booking?.purpose || "No purpose"}</span>
              </div>
              <div className="booking-detail-row">
                <span className="booking-detail-label">Attendees</span>
                <span className="booking-detail-value">
                  {viewModal.booking?.attendees ?? "-"} / {getCapacity(viewModal.booking?.resourceName) ?? "N/A"}
                </span>
              </div>
              <div className="booking-detail-row">
                <span className="booking-detail-label">Status</span>
                <span className={`booking-detail-value booking-status-${(viewModal.booking?.status || "").toLowerCase()}`}>
                  {formatStatus(viewModal.booking?.status)}
                </span>
              </div>
              {(() => {
                const start = formatDateTime(viewModal.booking?.startTime);
                const end = formatDateTime(viewModal.booking?.endTime);
                return (
                  <div className="booking-detail-row booking-detail-schedule">
                    <span className="booking-detail-label">Schedule</span>
                    <div className="booking-detail-schedule-value">
                      <div>{start.date} {start.time}</div>
                      <div className="booking-detail-schedule-sep">to</div>
                      <div>{end.date} {end.time}</div>
                    </div>
                  </div>
                );
              })()}
              {viewModal.booking?.rejectionReason ? (
                <div className="booking-detail-row">
                  <span className="booking-detail-label">Rejection Reason</span>
                  <span className="booking-detail-value booking-detail-reason">{viewModal.booking.rejectionReason}</span>
                </div>
              ) : null}
            </div>
            <div className="booking-confirm-actions">
              <button type="button" className="primary" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default BookingAdmin;
