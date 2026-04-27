import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
    case "APPROVED":
      return "bg-success-subtle text-success-emphasis border border-success-subtle";
    case "REJECTED":
      return "bg-danger-subtle text-danger-emphasis border border-danger-subtle";
    case "CANCELLED":
      return "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle";
    default:
      return "bg-light text-dark border";
  }
};

function BookingList() {
  const colors = {
    primaryDark: "#1A1F5A",
    primaryGradientEnd: "#2A3080",
    accentOrange: "#F5A623",
    accentOrangeHover: "#E09612",
    textDark: "#1A1F5A",
    textMedium: "#6B7BA4",
    textLight: "#C8D9FF",
    bgLight: "#F7F9FF",
    bgStats: "#F0F4FF",
    borderLight: "#E3E9F8",
    white: "#FFFFFF",
    danger: "#DC2626",
    pending: "#F59E0B",
    approved: "#0D9488",
    rejected: "#EF4444",
    cancelled: "#6B7280",
  };

  const getCardColor = (status) => {
    switch (status) {
      case "PENDING":
        return colors.pending;
      case "APPROVED":
        return colors.approved;
      case "REJECTED":
        return colors.rejected;
      case "CANCELLED":
        return colors.cancelled;
      default:
        return colors.primaryDark;
    }
  };

  const getStatusStyles = (status) => {
    const base = {
      backgroundColor: "#F3F4F8",
      borderColor: "#E0E6F0",
      color: colors.textMedium,
    };

    if (status === "PENDING") {
      return {
        backgroundColor: "#FFF5D6",
        borderColor: "#F7D58B",
        color: colors.pending,
      };
    }

    if (status === "APPROVED") {
      return {
        backgroundColor: "#E7FBF4",
        borderColor: "#8FE3C9",
        color: colors.approved,
      };
    }

    if (status === "REJECTED") {
      return {
        backgroundColor: "#FFE5E5",
        borderColor: "#F6B6B6",
        color: colors.rejected,
      };
    }

    if (status === "CANCELLED") {
      return {
        backgroundColor: "#EDEEF2",
        borderColor: "#D6D8E0",
        color: colors.cancelled,
      };
    }

    return base;
  };

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

  const styles = {
    page: {
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${colors.bgLight} 0%, ${colors.white} 100%)`,
      padding: "28px 20px 60px",
    },
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    hero: {
      background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryGradientEnd} 100%)`,
      borderRadius: "22px",
      padding: "26px 28px",
      color: colors.white,
      marginBottom: "22px",
      boxShadow: "0 18px 40px rgba(26, 31, 90, 0.16)",
    },
    heroTitle: {
      margin: 0,
      fontSize: "26px",
      fontWeight: "800",
      lineHeight: "1.2",
    },
    heroText: {
      marginTop: "10px",
      marginBottom: 0,
      color: colors.textLight,
      fontSize: "14px",
      lineHeight: "1.7",
      maxWidth: "640px",
    },
    filterContainer: {
      backgroundColor: colors.white,
      borderRadius: "18px",
      padding: "14px 16px",
      marginBottom: "22px",
      boxShadow: "0 8px 24px rgba(26, 31, 90, 0.08)",
      border: `1px solid ${colors.borderLight}`,
    },
    sectionTitle: {
      display: "none",
    },
    sectionText: {
      display: "none",
    },
    actionRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
      marginTop: "0px",
    },
    filterGroup: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      alignItems: "center",
      flex: 1,
    },
    input: {
      padding: "10px 12px",
      borderRadius: "12px",
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: "#F7F8FC",
      fontSize: "13px",
      color: colors.textDark,
      outline: "none",
      boxSizing: "border-box",
      fontWeight: "500",
    },
    primaryButton: {
      border: "none",
      borderRadius: "12px",
      backgroundColor: colors.accentOrange,
      color: colors.white,
      fontSize: "13px",
      fontWeight: "800",
      padding: "10px 16px",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: "0 10px 20px rgba(245, 166, 35, 0.2)",
      transition: "all 0.2s ease",
    },
    ghostButton: {
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "12px",
      backgroundColor: colors.white,
      color: colors.textDark,
      fontSize: "13px",
      fontWeight: "700",
      padding: "10px 12px",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    refreshButton: {
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "12px",
      backgroundColor: colors.white,
      width: "40px",
      height: "40px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: colors.textMedium,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    errorBox: {
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      color: colors.danger,
      padding: "12px 14px",
      borderRadius: "14px",
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: "20px",
    },
    toast: {
      position: "sticky",
      top: "14px",
      zIndex: 1850,
      margin: "0 0 10px auto",
      width: "fit-content",
      maxWidth: "min(460px, 92%)",
      borderRadius: "14px",
      border: "1px solid",
      padding: "11px 14px",
      fontSize: "0.9rem",
      fontWeight: "600",
      boxShadow: "0 14px 30px rgba(26, 31, 90, 0.16)",
    },
    toastSuccess: {
      background: "#ECFDF3",
      color: "#125132",
      borderColor: "#B4ECC8",
    },
    toastError: {
      background: "#FFF1F1",
      color: "#8C1D1D",
      borderColor: "#F8C3C3",
    },
    confirmBackdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      zIndex: 1900,
    },
    confirmCard: {
      width: "min(420px, 96vw)",
      borderRadius: "18px",
      border: `1px solid ${colors.borderLight}`,
      background: colors.white,
      boxShadow: "0 24px 50px rgba(10, 17, 62, 0.32)",
      padding: "22px",
      textAlign: "center",
    },
    confirmTitle: {
      margin: "4px 0 6px",
      fontSize: "1.1rem",
      color: colors.textDark,
    },
    confirmText: {
      margin: 0,
      color: colors.textMedium,
      lineHeight: "1.55",
      fontSize: "0.92rem",
    },
    confirmActions: {
      marginTop: "18px",
      display: "flex",
      justifyContent: "center",
      gap: "10px",
      flexWrap: "wrap",
    },
    confirmButtonGhost: {
      borderRadius: "12px",
      border: `1px solid ${colors.borderLight}`,
      background: colors.bgStats,
      color: colors.textDark,
      fontWeight: "700",
      padding: "8px 16px",
      cursor: "pointer",
    },
    confirmButtonPrimary: {
      borderRadius: "12px",
      border: "0",
      background: colors.accentOrange,
      color: colors.white,
      fontWeight: "700",
      padding: "8px 18px",
      cursor: "pointer",
    },
    cardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "16px",
      marginTop: "18px",
    },
    bookingCard: (status) => {
      return {
        backgroundColor: colors.white,
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 8px 24px rgba(26, 31, 90, 0.06)",
        border: `1px solid ${colors.borderLight}`,
        borderLeft: `3px solid ${getCardColor(status)}`,
        transition: "all 0.3s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      };
    },
    cardHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "10px",
    },
    cardHeaderLeft: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      flex: 1,
    },
    statusPill: (status) => ({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "10px",
      fontWeight: "800",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      border: `1px solid ${getStatusStyles(status).borderColor}`,
      backgroundColor: getStatusStyles(status).backgroundColor,
      color: getStatusStyles(status).color,
      width: "fit-content",
    }),
    cardMenu: {
      border: "none",
      background: "transparent",
      color: colors.textMedium,
      cursor: "pointer",
      padding: "4px",
    },
    cardTitle: {
      margin: 0,
      fontSize: "14px",
      fontWeight: "700",
      color: colors.textDark,
      lineHeight: "1.4",
    },
    cardSubtitle: {
      margin: "0",
      fontSize: "11px",
      color: colors.textMedium,
      fontWeight: "500",
      lineHeight: "1.6",
    },
    cardDetails: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginBottom: "16px",
      paddingTop: "4px",
      borderBottom: "none",
      flex: 1,
    },
    detailRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "11px",
      color: colors.textMedium,
    },
    detailIcon: {
      width: "14px",
      height: "14px",
      color: colors.textMedium,
    },
    cardFooter: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "10px",
      paddingTop: "12px",
      borderTop: `1px solid ${colors.borderLight}`,
    },
    footerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
    },
    createdBy: {
      fontSize: "11px",
      color: colors.textMedium,
      fontWeight: "600",
    },
    arrowButton: {
      minHeight: "34px",
      borderRadius: "10px",
      backgroundColor: colors.accentOrange,
      border: "none",
      color: colors.white,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "700",
      padding: "0 16px",
      transition: "all 0.2s ease",
    },
    actionGroup: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    actionSecondary: {
      borderRadius: "10px",
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      color: colors.textDark,
      fontSize: "12px",
      fontWeight: "700",
      padding: "6px 12px",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    actionDanger: {
      borderRadius: "10px",
      backgroundColor: "#FDECEC",
      border: "1px solid #F5C2C2",
      color: colors.danger,
      fontSize: "12px",
      fontWeight: "700",
      padding: "6px 12px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    actionGhost: {
      borderRadius: "10px",
      backgroundColor: "#F7F8FC",
      border: `1px solid ${colors.borderLight}`,
      color: colors.textMedium,
      fontSize: "12px",
      fontWeight: "700",
      padding: "6px 12px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    cardActions: {
      display: "none",
    },
    smallBtn: {
      display: "none",
    },
    smallBtnPrimary: {
      display: "none",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: colors.textMedium,
    },
    emptyStateTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: colors.textDark,
      marginBottom: "12px",
    },
  };
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resourceName, setResourceName] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    action: "",
    bookingId: null,
    message: "",
  });
  const { isAdmin } = useAuth();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBookings(resourceName, statusFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [resourceName, statusFilter]);

  useEffect(() => {
    if (!toast.show) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const fetchBookings = async (resource, status) => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      const trimmed = (resource ?? "").trim();

      if (trimmed) {
        params.resourceName = trimmed;
      }

      if (status && status !== "ALL") {
        params.status = status;
      }

      // Use my-bookings endpoint for regular users, all bookings for admin
      const endpoint = isAdmin ? "/bookings" : "/bookings/my-bookings";
      const response = await API.get(endpoint, { params });
      setBookings(response.data);
    } catch (e) {
      console.error("Error fetching bookings", e);
      setError("Couldn't load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openConfirm = (action, id) => {
    const message = action === "delete" ? "Delete this booking?" : "Cancel this booking?";
    setConfirmDialog({ show: true, action, bookingId: id, message });
  };

  const closeConfirm = () => {
    setConfirmDialog({ show: false, action: "", bookingId: null, message: "" });
  };

  const runConfirmAction = async () => {
    const { action, bookingId } = confirmDialog;
    closeConfirm();

    if (!action || !bookingId) return;

    try {
      if (action === "delete") {
        await API.delete(`/bookings/${bookingId}`);
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setToast({ show: true, message: "Booking deleted.", type: "success" });
        return;
      }

      await API.put(`/bookings/${bookingId}/cancel`);
      fetchBookings();
      setToast({ show: true, message: "Booking cancelled.", type: "success" });
    } catch (e) {
      console.error("Error updating booking", e);
      const message =
        action === "delete"
          ? "Couldn't delete booking. Please try again."
          : "Couldn't cancel booking. Please try again.";
      setToast({ show: true, message, type: "error" });
    }
  };

  const handleDelete = (id) => {
    openConfirm("delete", id);
  };

  const handleCancel = (id) => {
    openConfirm("cancel", id);
  };

  const handleRegenerateQr = async (bookingId) => {
    try {
      const response = await API.put(`/bookings/${bookingId}/qr`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? response.data : b))
      );
      setToast({ show: true, message: "QR regenerated.", type: "success" });
    } catch (e) {
      console.error("Error regenerating QR", e);
      setToast({ show: true, message: "Couldn't regenerate QR.", type: "error" });
    }
  };

  const buildQrUrl = (qrCode) => {
    const value = (qrCode ?? "").trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const apiBase = (API.defaults.baseURL ?? "").replace(/\/api\/?$/, "");
    const origin = apiBase || window.location.origin;
    return `${origin}/${value.replace(/^\/+/, "")}`;
  };

  const handleViewQr = (qrCode) => {
    const qrUrl = buildQrUrl(qrCode);

    if (!qrUrl) {
      setError("QR is not available for this booking yet.");
      return;
    }

    window.open(qrUrl, "_blank", "noopener,noreferrer");
  };

  const filteredBookings = useMemo(() => {
    const search = (resourceName ?? "").trim().toLowerCase();

    return bookings.filter((b) => {
      const name = ((b?.resourceName ?? "") + "").trim().toLowerCase();
      const statusOk = statusFilter === "ALL" ? true : b?.status === statusFilter;
      const searchOk = !search ? true : name.includes(search);
      return statusOk && searchOk;
    });
  }, [bookings, resourceName, statusFilter]);

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {toast.show ? (
          <div
            style={{
              ...styles.toast,
              ...(toast.type === "error" ? styles.toastError : styles.toastSuccess),
            }}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        ) : null}
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Booking Overview</h1>
          <p style={styles.heroText}>
            Manage your academic resource reservations in one streamlined interface,
            from lab equipment to specialized study pods.
          </p>
        </div>

        <div style={styles.filterContainer}>
          <h2 style={styles.sectionTitle}>Bookings</h2>
          <p style={styles.sectionText}>View all current bookings.</p>

          <div style={styles.actionRow}>
            <div style={styles.filterGroup}>
              <input
                type="text"
                placeholder="Search bookings..."
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                style={{ ...styles.input, width: 240 }}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...styles.input, width: 140 }}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                type="button"
                style={styles.refreshButton}
                onClick={() => fetchBookings(resourceName, statusFilter)}
                aria-label="Refresh"
                title="Refresh"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M21 12a9 9 0 1 1-2.64-6.36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M21 3v6h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <Link to="/create" style={styles.primaryButton}>
              <span aria-hidden="true">＋</span>
              Create Booking
            </Link>
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <div style={styles.emptyStateTitle}>Loading Bookings...</div>
            <p>Please wait while we fetch your bookings.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <div style={styles.emptyStateTitle}>No Bookings Found</div>
            <p>
              {bookings.length === 0
                ? "Create your first booking to get started!"
                : "No bookings match your filters. Try adjusting your search."}
            </p>
            <Link to="/create" style={styles.primaryButton}>
              Create Booking
            </Link>
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  ...styles.bookingCard(b.status),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 40px rgba(26, 31, 90, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(26, 31, 90, 0.06)";
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderLeft}>
                    <span style={styles.statusPill(b.status)}>{b.status}</span>
                    <h3 style={styles.cardTitle}>{b.resourceName}</h3>
                    <p style={styles.cardSubtitle}>{b.purpose || "No Purpose"}</p>
                  </div>
                  <button type="button" style={styles.cardMenu} aria-label="More">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <circle cx="12" cy="5" r="2" fill="currentColor" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                      <circle cx="12" cy="19" r="2" fill="currentColor" />
                    </svg>
                  </button>
                </div>

                <div style={styles.cardDetails}>
                  <div style={styles.detailRow}>
                    <svg viewBox="0 0 24 24" style={styles.detailIcon} aria-hidden="true">
                      <path d="M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M4 20c1.6-3 4.5-5 8-5s6.4 2 8 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    {b.attendees} Attendees
                  </div>
                  <div style={styles.detailRow}>
                    <svg viewBox="0 0 24 24" style={styles.detailIcon} aria-hidden="true">
                      <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M8 3v4M16 3v4M4 10h16" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    {formatDateTime(b.startTime).date} · {formatDateTime(b.startTime).time}
                  </div>
                  {b.status === "REJECTED" && (
                    <div style={styles.detailRow}>
                      <svg viewBox="0 0 24 24" style={styles.detailIcon} aria-hidden="true">
                        <path d="M12 8v5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                      {b.rejectionReason || "Rejected without a reason"}
                    </div>
                  )}
                  <div style={styles.detailRow}>
                    <svg viewBox="0 0 24 24" style={styles.detailIcon} aria-hidden="true">
                      <path d="M4 12h16" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M12 4v16" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    Booked by {b.bookedBy || "-"}
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.footerRow}>
                    <span style={styles.createdBy}>
                      Booked by: <strong>{b.bookedBy || "-"}</strong>
                    </span>
                    {b.status === "PENDING" && (
                      <div style={styles.actionGroup}>
                        <Link
                          to={`/bookings/${b.id}/edit`}
                          style={styles.actionSecondary}
                        >
                          Update
                        </Link>
                        <button
                          type="button"
                          style={styles.actionDanger}
                          onClick={() => handleDelete(b.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    {b.status === "APPROVED" && (
                      <div style={styles.actionGroup}>
                        <button
                          type="button"
                          style={styles.arrowButton}
                          onClick={() => handleViewQr(b.qrCode)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.accentOrangeHover;
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.accentOrange;
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          View QR
                        </button>
                        <button
                          type="button"
                          style={styles.actionGhost}
                          onClick={() => handleRegenerateQr(b.id)}
                        >
                          Regenerate QR
                        </button>
                        <button
                          type="button"
                          style={styles.actionGhost}
                          onClick={() => handleCancel(b.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {confirmDialog.show ? (
        <div
          style={styles.confirmBackdrop}
          role="presentation"
          onClick={closeConfirm}
        >
          <section
            style={styles.confirmCard}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm booking action"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={styles.confirmTitle}>Confirm action</h3>
            <p style={styles.confirmText}>{confirmDialog.message}</p>
            <div style={styles.confirmActions}>
              <button type="button" style={styles.confirmButtonGhost} onClick={closeConfirm}>
                Cancel
              </button>
              <button type="button" style={styles.confirmButtonPrimary} onClick={runConfirmAction}>
                Confirm
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default BookingList;
