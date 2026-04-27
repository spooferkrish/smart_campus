import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { getTechnicianLabel } from "../../utils/technicianLabels";
import { useAuth } from "../../context/AuthContext";

function MyTickets() {
  const { user } = useAuth();

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
    footerText: "#B6C6F0",
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#2563EB",
    muted: "#94A3B8",
  };

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return colors.info;
      case "IN_PROGRESS":
        return colors.warning;
      case "RESOLVED":
        return colors.success;
      case "CLOSED":
        return colors.primaryDark;
      case "REJECTED":
        return colors.danger;
      default:
        return colors.muted;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return colors.danger;
      case "MEDIUM":
        return colors.warning;
      case "LOW":
        return colors.success;
      default:
        return colors.textMedium;
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    return new Date(dateValue).toLocaleString();
  };

  const fetchMyTickets = async () => {
    if (!user?.id) {
      setTickets([]);
      setLoading(false);
      setError("Unable to determine current user.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/tickets/user/${user.id}`);
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Unable to load your tickets right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [user?.id]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const resolvedTickets = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;

  const styles = {
    page: {
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${colors.bgLight} 0%, #ffffff 100%)`,
      padding: "36px 24px 50px",
    },
    container: {
      maxWidth: "1180px",
      margin: "0 auto",
    },
    heroCard: {
      background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryGradientEnd} 100%)`,
      borderRadius: "24px",
      padding: "32px",
      color: colors.white,
      boxShadow: "0 20px 50px rgba(26, 31, 90, 0.18)",
      marginBottom: "28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      flexWrap: "wrap",
    },
    heroLeft: {
      flex: "1 1 420px",
    },
    heroTitle: {
      margin: 0,
      fontSize: "34px",
      fontWeight: "800",
      lineHeight: "1.2",
    },
    heroText: {
      marginTop: "12px",
      marginBottom: 0,
      color: colors.textLight,
      fontSize: "15px",
      lineHeight: "1.7",
      maxWidth: "700px",
    },
    heroButtonGroup: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      marginTop: "18px",
    },
    primaryButton: {
      backgroundColor: colors.accentOrange,
      color: colors.white,
      border: "none",
      borderRadius: "12px",
      padding: "12px 18px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButton: {
      backgroundColor: "rgba(255,255,255,0.12)",
      color: colors.white,
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: "12px",
      padding: "12px 18px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "18px",
      marginBottom: "26px",
    },
    statCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "20px",
      padding: "20px",
      boxShadow: "0 10px 28px rgba(26, 31, 90, 0.06)",
    },
    statLabel: {
      fontSize: "13px",
      color: colors.textMedium,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.7px",
      marginBottom: "10px",
    },
    statValue: {
      fontSize: "30px",
      fontWeight: "800",
      color: colors.textDark,
      lineHeight: "1",
    },
    statHint: {
      fontSize: "13px",
      color: colors.textMedium,
      marginTop: "10px",
      lineHeight: "1.5",
    },
    filterCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "20px",
      padding: "22px",
      boxShadow: "0 10px 28px rgba(26, 31, 90, 0.06)",
      marginBottom: "26px",
    },
    filterHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "18px",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "800",
      color: colors.textDark,
    },
    sectionSubtext: {
      marginTop: "6px",
      marginBottom: 0,
      fontSize: "14px",
      color: colors.textMedium,
    },
    filtersGrid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr",
      gap: "14px",
    },
    inputWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    inputLabel: {
      fontSize: "13px",
      fontWeight: "700",
      color: colors.textDark,
    },
    input: {
      height: "46px",
      borderRadius: "12px",
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: colors.white,
      padding: "0 14px",
      fontSize: "14px",
      color: colors.textDark,
      outline: "none",
    },
    select: {
      height: "46px",
      borderRadius: "12px",
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: colors.white,
      padding: "0 14px",
      fontSize: "14px",
      color: colors.textDark,
      outline: "none",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "18px",
    },
    resultText: {
      color: colors.textMedium,
      fontSize: "14px",
      margin: 0,
    },
    refreshButton: {
      backgroundColor: colors.accentOrange,
      color: colors.white,
      border: "none",
      borderRadius: "12px",
      padding: "11px 18px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
    },
    ticketGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "20px",
    },
    ticketCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "22px",
      padding: "22px",
      boxShadow: "0 14px 30px rgba(26, 31, 90, 0.07)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    ticketTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "14px",
    },
    ticketTitleWrap: {
      flex: 1,
    },
    ticketTitle: {
      margin: 0,
      fontSize: "20px",
      fontWeight: "800",
      color: colors.textDark,
      lineHeight: "1.35",
    },
    ticketId: {
      marginTop: "6px",
      fontSize: "13px",
      color: colors.textMedium,
      fontWeight: "600",
    },
    statusBadge: {
      padding: "7px 12px",
      borderRadius: "999px",
      color: colors.white,
      fontSize: "12px",
      fontWeight: "800",
      whiteSpace: "nowrap",
    },
    descriptionBox: {
      backgroundColor: colors.bgStats,
      borderRadius: "14px",
      padding: "14px",
    },
    descriptionText: {
      margin: 0,
      fontSize: "14px",
      color: colors.textDark,
      lineHeight: "1.7",
    },
    metaGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "14px",
    },
    metaItem: {
      backgroundColor: "#FBFCFF",
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "14px",
      padding: "14px",
    },
    metaLabel: {
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.7px",
      color: colors.textMedium,
      fontWeight: "800",
      marginBottom: "8px",
    },
    metaValue: {
      fontSize: "14px",
      color: colors.textDark,
      fontWeight: "700",
      lineHeight: "1.5",
      wordBreak: "break-word",
    },
    priorityPill: {
      display: "inline-block",
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: "800",
      backgroundColor: colors.bgStats,
    },
    footerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
      marginTop: "4px",
    },
    smallText: {
      fontSize: "13px",
      color: colors.textMedium,
      margin: 0,
    },
    detailsLink: {
      textDecoration: "none",
      color: colors.primaryDark,
      fontSize: "14px",
      fontWeight: "800",
    },
    editLink: {
      textDecoration: "none",
      color: colors.primaryDark,
      fontSize: "13px",
      fontWeight: "800",
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "10px",
      padding: "8px 12px",
      backgroundColor: colors.white,
    },
    footerActions: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
    },
    loadingBox: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "20px",
      padding: "28px",
      color: colors.textMedium,
      boxShadow: "0 10px 28px rgba(26, 31, 90, 0.06)",
    },
    errorBox: {
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      color: colors.danger,
      borderRadius: "16px",
      padding: "16px 18px",
      marginBottom: "18px",
      fontWeight: "600",
    },
    emptyBox: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "22px",
      padding: "40px 24px",
      textAlign: "center",
      boxShadow: "0 10px 28px rgba(26, 31, 90, 0.06)",
    },
    emptyTitle: {
      fontSize: "22px",
      fontWeight: "800",
      color: colors.textDark,
      marginBottom: "10px",
    },
    emptyText: {
      fontSize: "14px",
      color: colors.textMedium,
      lineHeight: "1.7",
      marginBottom: "18px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.heroCard}>
          <div style={styles.heroLeft}>
            <h1 style={styles.heroTitle}>My Maintenance Tickets</h1>
            <p style={styles.heroText}>
              Track all reported issues in one place. Check current status,
              review progress, and stay updated on what has been resolved and
              what still needs attention.
            </p>

            <div style={styles.heroButtonGroup}>
              <Link to="/tickets/create" style={styles.primaryButton}>
                + Create New Ticket
              </Link>

              <button style={styles.secondaryButton} onClick={fetchMyTickets}>
                Refresh List
              </button>
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Tickets</div>
            <div style={styles.statValue}>{totalTickets}</div>
            <div style={styles.statHint}>
              All issues you have reported so far.
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Open</div>
            <div style={styles.statValue}>{openTickets}</div>
            <div style={styles.statHint}>
              New tickets waiting for action.
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>In Progress</div>
            <div style={styles.statValue}>{inProgressTickets}</div>
            <div style={styles.statHint}>
              Tickets currently being handled.
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Resolved / Closed</div>
            <div style={styles.statValue}>{resolvedTickets}</div>
            <div style={styles.statHint}>
              Completed issues and finished work.
            </div>
          </div>
        </div>

        <div style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Find Your Tickets Easily</h2>
              <p style={styles.sectionSubtext}>
                Search by title, description, or category and narrow results by
                status and priority.
              </p>
            </div>

            <button style={styles.refreshButton} onClick={fetchMyTickets}>
              Refresh
            </button>
          </div>

          <div style={styles.filtersGrid}>
            <div style={styles.inputWrap}>
              <label style={styles.inputLabel}>Search</label>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputWrap}>
              <label style={styles.inputLabel}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div style={styles.inputWrap}>
              <label style={styles.inputLabel}>Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={styles.select}
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.topRow}>
          <p style={styles.resultText}>
            Showing <strong>{filteredTickets.length}</strong> ticket
            {filteredTickets.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading your tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyTitle}>No matching tickets found</div>
            <div style={styles.emptyText}>
              Try changing your filters or create a new ticket for a campus
              issue you want to report.
            </div>

            <Link to="/tickets/create" style={styles.primaryButton}>
              Create Ticket
            </Link>
          </div>
        ) : (
          <div style={styles.ticketGrid}>
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} style={styles.ticketCard}>
                <div style={styles.ticketTop}>
                  <div style={styles.ticketTitleWrap}>
                    <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                    <div style={styles.ticketId}>Ticket ID: #{ticket.id}</div>
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(ticket.status),
                    }}
                  >
                    {ticket.status?.replace("_", " ")}
                  </span>
                </div>

                <div style={styles.descriptionBox}>
                  <p style={styles.descriptionText}>
                    {ticket.description || "No description available."}
                  </p>
                </div>

                <div style={styles.metaGrid}>
                  <div style={styles.metaItem}>
                    <div style={styles.metaLabel}>Category</div>
                    <div style={styles.metaValue}>
                      {ticket.category || "Not specified"}
                    </div>
                  </div>

                  <div style={styles.metaItem}>
                    <div style={styles.metaLabel}>Priority</div>
                    <div style={styles.metaValue}>
                      <span
                        style={{
                          ...styles.priorityPill,
                          color: getPriorityColor(ticket.priority),
                        }}
                      >
                        {ticket.priority || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div style={styles.metaItem}>
                    <div style={styles.metaLabel}>Assigned Technician</div>
                    <div style={styles.metaValue}>
                      {ticket.assignedTo
                        ? getTechnicianLabel(ticket.assignedTo)
                        : "Not assigned yet"}
                    </div>
                  </div>

                  <div style={styles.metaItem}>
                    <div style={styles.metaLabel}>Current Status</div>
                    <div style={styles.metaValue}>
                      {ticket.status?.replace("_", " ") || "N/A"}
                    </div>
                  </div>

                  <div style={styles.metaItem}>
                    <div style={styles.metaLabel}>Created At</div>
                    <div style={styles.metaValue}>
                      {formatDate(ticket.createdAt)}
                    </div>
                  </div>

                  <div style={styles.metaItem}>
                    <div style={styles.metaLabel}>Resolved At</div>
                    <div style={styles.metaValue}>
                      {ticket.resolvedAt
                        ? formatDate(ticket.resolvedAt)
                        : "Not resolved yet"}
                    </div>
                  </div>
                </div>

                <div style={styles.footerRow}>
                  <p style={styles.smallText}>
                    Keep checking this page for new updates.
                  </p>

                  <div style={styles.footerActions}>
                    {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                    user?.role !== "TECHNICIAN" &&
                      <Link
                        to={`/tickets/edit/${ticket.id}`}
                        style={styles.editLink}
                      >
                        Edit Ticket
                      </Link>
                    )}

                    <Link to={`/tickets/details/${ticket.id}`} style={styles.detailsLink}>
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTickets;