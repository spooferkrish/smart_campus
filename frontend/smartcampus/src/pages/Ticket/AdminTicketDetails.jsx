import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../services/api";
import { getTechnicianLabel } from "../../utils/technicianLabels";
import { useAuth } from "../../context/AuthContext";

function AdminTicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isTechnician = user?.role === "TECHNICIAN";
  const ticketsListPath = isAdmin
    ? "/tickets/admin"
    : isTechnician
      ? "/tickets/technician"
      : "/tickets/my";
  const ticketsListLabel = isAdmin
    ? "All Tickets"
    : isTechnician
      ? "Assigned Tickets"
      : "My Tickets";

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
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#2563EB",
    muted: "#94A3B8",
  };

  const [ticket, setTicket] = useState(null);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setPageError("");

      const [ticketResponse, historyResponse] = await Promise.all([
        API.get(`/tickets/${id}`),
        API.get(`/tickets/${id}/assignment-history`),
      ]);

      setTicket(ticketResponse.data);
      setAssignmentHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
    } catch (err) {
      console.error("Failed to fetch admin ticket details:", err);
      setPageError("Unable to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    return new Date(dateValue).toLocaleString();
  };

  const formatDuration = (minutes) => {
    if (minutes == null) return "Not available yet";

    const safeMinutes = Math.max(Number(minutes) || 0, 0);
    const days = Math.floor(safeMinutes / 1440);
    const hours = Math.floor((safeMinutes % 1440) / 60);
    const mins = safeMinutes % 60;

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${hours}h`);
    parts.push(`${mins}m`);

    return parts.join(" ");
  };

  const apiBaseUrl = API.defaults.baseURL?.replace(/\/api\/?$/, "") || "";

  const buildImageUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    let normalized = String(path)
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\.\//, "")
      .replace(/^\/+/, "");
    if (!normalized.includes("/")) {
      normalized = `uploads/tickets/${normalized}`;
    }
    if (normalized.startsWith("uploads/")) {
      normalized = normalized.replace(/^uploads\//, "");
    }
    return `${apiBaseUrl}/${normalized}`;
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "OPEN":
        return { bg: "#EAF2FF", color: colors.info };
      case "IN_PROGRESS":
        return { bg: "#FFF4DD", color: colors.warning };
      case "RESOLVED":
        return { bg: "#EAFBF0", color: colors.success };
      case "CLOSED":
        return { bg: "#ECEFFD", color: colors.primaryDark };
      case "REJECTED":
        return { bg: "#FDECEC", color: colors.danger };
      default:
        return { bg: "#EEF2F7", color: colors.textMedium };
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "HIGH":
        return { bg: "#FDECEC", color: colors.danger };
      case "MEDIUM":
        return { bg: "#FFF4DD", color: colors.warning };
      case "LOW":
        return { bg: "#EAFBF0", color: colors.success };
      default:
        return { bg: "#EEF2F7", color: colors.textMedium };
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${colors.bgLight} 0%, #ffffff 100%)`,
      padding: "40px 22px 60px",
    },
    container: {
      maxWidth: "1120px",
      margin: "0 auto",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "14px",
      flexWrap: "wrap",
      marginBottom: "20px",
    },
    backLink: {
      textDecoration: "none",
      color: colors.primaryDark,
      fontSize: "14px",
      fontWeight: "800",
    },
    refreshButton: {
      backgroundColor: colors.white,
      color: colors.primaryDark,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "14px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 8px 18px rgba(26, 31, 90, 0.05)",
    },
    heroCard: {
      background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryGradientEnd} 100%)`,
      borderRadius: "26px",
      padding: "28px",
      color: colors.white,
      boxShadow: "0 20px 50px rgba(26, 31, 90, 0.18)",
      marginBottom: "24px",
    },
    heroTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "18px",
      flexWrap: "wrap",
    },
    heroLeft: {
      flex: 1,
      minWidth: "250px",
    },
    eyebrow: {
      display: "inline-block",
      padding: "7px 14px",
      borderRadius: "999px",
      backgroundColor: "rgba(255,255,255,0.14)",
      color: colors.white,
      fontSize: "12px",
      fontWeight: "800",
      letterSpacing: "0.7px",
      textTransform: "uppercase",
      marginBottom: "14px",
    },
    title: {
      margin: 0,
      fontSize: "34px",
      lineHeight: "1.2",
      fontWeight: "800",
    },
    subtitle: {
      marginTop: "12px",
      marginBottom: 0,
      color: colors.textLight,
      fontSize: "15px",
      lineHeight: "1.8",
      maxWidth: "760px",
    },
    pillRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "18px",
    },
    subNav: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "16px",
      padding: "8px",
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: "8px",
      marginBottom: "20px",
      boxShadow: "0 8px 18px rgba(26, 31, 90, 0.04)",
    },
    subNavLink: {
      textDecoration: "none",
      color: colors.primaryDark,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "10px",
      padding: "10px 12px",
      fontSize: "13px",
      fontWeight: "700",
      backgroundColor: colors.white,
      textAlign: "center",
      whiteSpace: "nowrap",
    },
    subNavActive: {
      textDecoration: "none",
      color: colors.white,
      border: `1px solid ${colors.primaryDark}`,
      borderRadius: "10px",
      padding: "10px 12px",
      fontSize: "13px",
      fontWeight: "800",
      backgroundColor: colors.primaryDark,
      textAlign: "center",
      whiteSpace: "nowrap",
    },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px 13px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "800",
    },
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "1.45fr 0.95fr",
      gap: "20px",
    },
    card: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "24px",
      padding: "24px",
      boxShadow: "0 14px 28px rgba(26, 31, 90, 0.05)",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "800",
      color: colors.textDark,
      marginBottom: "16px",
    },
    descriptionBox: {
      backgroundColor: "#FBFCFF",
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "18px",
      padding: "18px",
      marginBottom: "18px",
    },
    descriptionText: {
      margin: 0,
      fontSize: "15px",
      color: colors.textMedium,
      lineHeight: "1.9",
      whiteSpace: "pre-wrap",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "14px",
    },
    infoBox: {
      backgroundColor: "#FBFCFF",
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "16px",
      padding: "15px",
    },
    infoLabel: {
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.7px",
      fontWeight: "800",
      color: colors.textMedium,
      marginBottom: "8px",
    },
    infoValue: {
      fontSize: "14px",
      fontWeight: "700",
      color: colors.textDark,
      lineHeight: "1.6",
      wordBreak: "break-word",
    },
    imageBox: {
      gridColumn: "1 / -1",
    },
    imageGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "12px",
      marginTop: "8px",
    },
    imageItem: {
      display: "block",
      borderRadius: "12px",
      overflow: "hidden",
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: "#FBFCFF",
      boxShadow: "0 8px 18px rgba(26, 31, 90, 0.08)",
    },
    image: {
      width: "100%",
      height: "140px",
      objectFit: "cover",
      display: "block",
    },
    assignmentHistoryWrap: {
      marginTop: "22px",
      borderTop: `1px solid ${colors.borderLight}`,
      paddingTop: "18px",
    },
    assignmentList: {
      display: "grid",
      gap: "12px",
      marginTop: "10px",
    },
    assignmentItem: {
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "14px",
      padding: "12px 14px",
      backgroundColor: "#FBFCFF",
      boxShadow: "0 8px 16px rgba(26, 31, 90, 0.06)",
    },
    assignmentTitle: {
      margin: 0,
      fontSize: "14px",
      fontWeight: "800",
      color: colors.textDark,
    },
    assignmentMeta: {
      margin: "6px 0 0",
      fontSize: "13px",
      color: colors.textMedium,
      lineHeight: "1.7",
    },
    sideStack: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    timelineItem: {
      display: "flex",
      gap: "12px",
      alignItems: "flex-start",
      paddingBottom: "16px",
      marginBottom: "16px",
      borderBottom: `1px solid ${colors.borderLight}`,
    },
    timelineDot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: colors.accentOrange,
      marginTop: "6px",
      flexShrink: 0,
    },
    timelineContent: {
      flex: 1,
    },
    timelineTitle: {
      margin: 0,
      fontSize: "14px",
      fontWeight: "800",
      color: colors.textDark,
      marginBottom: "4px",
    },
    timelineText: {
      margin: 0,
      fontSize: "13px",
      color: colors.textMedium,
      lineHeight: "1.7",
    },
    loadingBox: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "20px",
      padding: "26px",
      color: colors.textMedium,
      boxShadow: "0 12px 26px rgba(26, 31, 90, 0.05)",
    },
    errorBox: {
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      borderRadius: "16px",
      padding: "16px",
      color: colors.danger,
      marginBottom: "16px",
      fontWeight: "600",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingBox}>Loading admin ticket details...</div>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.errorBox}>{pageError}</div>
          <Link to={ticketsListPath} style={styles.backLink}>
            ← Back to {ticketsListLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingBox}>Ticket not found.</div>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyles(ticket.status);
  const priorityStyle = getPriorityStyles(ticket.priority);
  const navSections = [
    { to: `/tickets/details/${ticket.id}`, label: "Ticket Details", active: true },
    { to: `/tickets/comments/${ticket.id}`, label: "Comments", active: false },
    { to: `/tickets/assign/${ticket.id}`, label: "Assign Technician", active: false },
    { to: `/tickets/update-status/${ticket.id}`, label: "Status Update", active: false },
    { to: ticketsListPath, label: ticketsListLabel, active: false },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <Link to={ticketsListPath} style={styles.backLink}>
            ← Back to {ticketsListLabel}
          </Link>

          <button style={styles.refreshButton} onClick={fetchTicket}>
            Refresh Details
          </button>
        </div>

        <div style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.heroLeft}>
              <div style={styles.eyebrow}>Admin Ticket Details</div>
              <h1 style={styles.title}>{ticket.title}</h1>
              <p style={styles.subtitle}>
                Review this ticket in the admin workflow, verify current
                assignment and status, and continue to the next management
                action when needed.
              </p>

              <div style={styles.pillRow}>
                <span
                  style={{
                    ...styles.pill,
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                  }}
                >
                  {ticket.status?.replace("_", " ")}
                </span>

                <span
                  style={{
                    ...styles.pill,
                    backgroundColor: priorityStyle.bg,
                    color: priorityStyle.color,
                  }}
                >
                  {ticket.priority || "N/A"} Priority
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.subNav,
            gridTemplateColumns: `repeat(${navSections.length}, minmax(0, 1fr))`,
          }}
        >
          {navSections.map((section) => (
            <Link
              key={section.to}
              to={section.to}
              style={section.active ? styles.subNavActive : styles.subNavLink}
            >
              {section.label}
            </Link>
          ))}
        </div>

        <div style={styles.contentGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Ticket Information</h2>

            <div style={styles.descriptionBox}>
              <p style={styles.descriptionText}>
                {ticket.description || "No description available."}
              </p>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Ticket ID</div>
                <div style={styles.infoValue}>#{ticket.id}</div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Category</div>
                <div style={styles.infoValue}>
                  {ticket.category || "Not specified"}
                </div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Created By</div>
                <div style={styles.infoValue}>
                  {ticket.createdByName
                    || (ticket.createdBy ? `User #${ticket.createdBy}` : "N/A")}
                </div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Assigned Technician</div>
                <div style={styles.infoValue}>
                  {ticket.assignedToName
                    || (ticket.assignedTo ? getTechnicianLabel(ticket.assignedTo) : "Not assigned yet")}
                </div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Created At</div>
                <div style={styles.infoValue}>{formatDate(ticket.createdAt)}</div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Updated At</div>
                <div style={styles.infoValue}>{formatDate(ticket.updatedAt)}</div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Resolved At</div>
                <div style={styles.infoValue}>
                  {ticket.resolvedAt
                    ? formatDate(ticket.resolvedAt)
                    : "Not resolved yet"}
                </div>
              </div>

              <div style={{ ...styles.infoBox, ...styles.imageBox }}>
                <div style={styles.infoLabel}>Images</div>
                {Array.isArray(ticket.images) && ticket.images.length > 0 ? (
                  <div style={styles.imageGrid}>
                    {ticket.images.map((imagePath, index) => {
                      const imageUrl = buildImageUrl(imagePath);
                      return (
                        <a
                          key={`${ticket.id}-image-${index}`}
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.imageItem}
                        >
                          <img
                            src={imageUrl}
                            alt={`Ticket ${ticket.id} image ${index + 1}`}
                            style={styles.image}
                          />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div style={styles.infoValue}>No image attached</div>
                )}
              </div>
            </div>

            <div style={styles.assignmentHistoryWrap}>
              <h2 style={styles.sectionTitle}>Assignment History</h2>
              {assignmentHistory.length === 0 ? (
                <p style={styles.timelineText}>No assignment updates recorded yet.</p>
              ) : (
                <div style={styles.assignmentList}>
                  {assignmentHistory.map((item) => (
                    <div key={item.id} style={styles.assignmentItem}>
                      <p style={styles.assignmentTitle}>
                        {item.fromTechnicianName || "Unassigned"} to {item.toTechnicianName || "Unassigned"}
                      </p>
                      <p style={styles.assignmentMeta}>
                        Assigned by {item.assignedByName || "Unknown"} on {formatDate(item.assignedAt)}
                      </p>
                      <p style={styles.assignmentMeta}>
                        Reason: {item.reason || "No reason provided"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.sideStack}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Admin Workflow Summary</h2>

              <div style={styles.timelineItem}>
                <div style={styles.timelineDot}></div>
                <div style={styles.timelineContent}>
                  <p style={styles.timelineTitle}>Ticket Submitted</p>
                  <p style={styles.timelineText}>
                    This issue was created on {formatDate(ticket.createdAt)}.
                  </p>
                </div>
              </div>

              <div style={styles.timelineItem}>
                <div style={styles.timelineDot}></div>
                <div style={styles.timelineContent}>
                  <p style={styles.timelineTitle}>First Response Time</p>
                  <p style={styles.timelineText}>
                    {ticket.timeToFirstResponseMinutes != null
                      ? `First staff response in ${formatDuration(ticket.timeToFirstResponseMinutes)} (${formatDate(ticket.firstResponseAt)}).`
                      : "No staff response recorded yet."}
                  </p>
                </div>
              </div>

              <div style={styles.timelineItem}>
                <div style={styles.timelineDot}></div>
                <div style={styles.timelineContent}>
                  <p style={styles.timelineTitle}>Current Assignment</p>
                  <p style={styles.timelineText}>
                    {ticket.assignedTo
                      ? `This ticket is assigned to ${ticket.assignedToName || getTechnicianLabel(ticket.assignedTo)}.`
                      : "This ticket has not been assigned yet."}
                  </p>
                </div>
              </div>

              <div
                style={{
                  ...styles.timelineItem,
                  borderBottom: "none",
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              >
                <div style={styles.timelineDot}></div>
                <div style={styles.timelineContent}>
                  <p style={styles.timelineTitle}>Current Status</p>
                  <p style={styles.timelineText}>
                    The ticket is currently marked as{" "}
                    <strong>{ticket.status?.replace("_", " ") || "N/A"}</strong>.
                  </p>
                  <p style={{ ...styles.timelineText, marginTop: "8px" }}>
                    Resolution timer: {ticket.timeToResolutionMinutes != null
                      ? formatDuration(ticket.timeToResolutionMinutes)
                      : "Not resolved yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTicketDetails;