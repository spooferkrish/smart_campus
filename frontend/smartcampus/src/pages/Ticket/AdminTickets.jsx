import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { getTechnicianLabel } from "../../utils/technicianLabels";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import "../Admin/AdminDashboard.css";

function AdminTickets() {
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

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/tickets");
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch all tickets:", err);
      setError("Unable to load all tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(ticket.id).includes(searchTerm);

      const matchesStatus =
        statusFilter === "ALL" || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

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

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    return new Date(dateValue).toLocaleString();
  };

  const formatDuration = (minutes) => {
    if (minutes == null) return "N/A";

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

  const getAverageMinutes = (values) => {
    if (!values.length) return null;
    const sum = values.reduce((acc, value) => acc + value, 0);
    return Math.round(sum / values.length);
  };

  const totalTickets = tickets.length;
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;
  const firstResponseValues = tickets
    .map((ticket) => ticket.timeToFirstResponseMinutes)
    .filter((value) => value != null);
  const resolutionValues = tickets
    .map((ticket) => ticket.timeToResolutionMinutes)
    .filter((value) => value != null);
  const avgFirstResponseMinutes = getAverageMinutes(firstResponseValues);
  const avgResolutionMinutes = getAverageMinutes(resolutionValues);
  const firstResponseBreaches = tickets.filter((ticket) => ticket.firstResponseSlaBreached).length;
  const resolutionBreaches = tickets.filter((ticket) => ticket.resolutionSlaBreached).length;
  const focusTicketId = filteredTickets[0]?.id || tickets[0]?.id;
  const navSections = [
    {
      to: focusTicketId ? `/tickets/admin/details/${focusTicketId}` : "/tickets/admin",
      label: "Ticket Details",
      active: false,
    },
    {
      to: focusTicketId ? `/tickets/comments/${focusTicketId}` : "/tickets/admin",
      label: "Comments",
      active: false,
    },
    {
      to: focusTicketId ? `/tickets/assign/${focusTicketId}` : "/tickets/admin",
      label: "Assign Technician",
      active: false,
    },
    {
      to: focusTicketId ? `/tickets/update-status/${focusTicketId}` : "/tickets/admin",
      label: "Status Update",
      active: false,
    },
    {
      to: "/tickets/admin",
      label: "All Tickets",
      active: true,
    },
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${colors.bgLight} 0%, #ffffff 100%)`,
      padding: "40px 22px 60px",
    },
    container: {
      maxWidth: "1180px",
      margin: "0 auto",
    },
    heroCard: {
      background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryGradientEnd} 100%)`,
      borderRadius: "24px",
      padding: "30px",
      color: colors.white,
      boxShadow: "0 20px 50px rgba(26, 31, 90, 0.18)",
      marginBottom: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      flexWrap: "wrap",
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
      maxWidth: "760px",
    },
    heroButtons: {
      display: "flex",
      gap: "12px",
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
      marginBottom: "18px",
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
    primaryButton: {
      backgroundColor: colors.accentOrange,
      color: colors.white,
      border: "none",
      borderRadius: "12px",
      padding: "12px 18px",
      fontSize: "14px",
      fontWeight: "700",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
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
      marginBottom: "24px",
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
    filterCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "20px",
      padding: "22px",
      boxShadow: "0 10px 28px rgba(26, 31, 90, 0.06)",
      marginBottom: "24px",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "800",
      color: colors.textDark,
    },
    sectionSubtext: {
      marginTop: "6px",
      marginBottom: "18px",
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
    resultText: {
      color: colors.textMedium,
      fontSize: "14px",
      marginBottom: "16px",
    },
    tableWrap: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "20px",
      boxShadow: "0 10px 28px rgba(26, 31, 90, 0.06)",
      overflow: "hidden",
    },
    tableScroller: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "1050px",
    },
    th: {
      backgroundColor: "#F9FBFF",
      color: colors.textDark,
      fontSize: "13px",
      fontWeight: "800",
      textAlign: "left",
      padding: "16px",
      borderBottom: `1px solid ${colors.borderLight}`,
      textTransform: "uppercase",
      letterSpacing: "0.6px",
    },
    td: {
      padding: "16px",
      borderBottom: `1px solid ${colors.borderLight}`,
      fontSize: "14px",
      color: colors.textDark,
      verticalAlign: "top",
    },
    statusBadge: {
      display: "inline-block",
      padding: "7px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "800",
      whiteSpace: "nowrap",
    },
    priorityPill: {
      display: "inline-block",
      padding: "7px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "800",
    },
    actionGroup: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    actionLink: {
      textDecoration: "none",
      color: colors.primaryDark,
      fontSize: "13px",
      fontWeight: "800",
      backgroundColor: colors.bgStats,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "10px",
      padding: "9px 12px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
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
      borderRadius: "20px",
      padding: "36px 24px",
      textAlign: "center",
      boxShadow: "0 10px 28px rgba(26, 31, 90, 0.06)",
    },
  };

  return (
    <section className="admin-layout">
      <AdminSidebar />

      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.heroCard}>
            <div>
              <h1 style={styles.heroTitle}>Admin Ticket Management</h1>
              <p style={styles.heroText}>
                Review all maintenance tickets, monitor workflow, and open the
                next action pages for assignment and status handling.
              </p>

              <div style={styles.heroButtons}>
                <button style={styles.secondaryButton} onClick={fetchAllTickets}>
                  Refresh Tickets
                </button>
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
                key={section.label}
                to={section.to}
                style={section.active ? styles.subNavActive : styles.subNavLink}
              >
                {section.label}
              </Link>
            ))}
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Tickets</div>
              <div style={styles.statValue}>{totalTickets}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Open</div>
              <div style={styles.statValue}>{openCount}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>In Progress</div>
              <div style={styles.statValue}>{inProgressCount}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Resolved / Closed</div>
              <div style={styles.statValue}>{resolvedCount}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Avg First Response</div>
              <div style={styles.statValue}>{formatDuration(avgFirstResponseMinutes)}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Avg Resolution Time</div>
              <div style={styles.statValue}>{formatDuration(avgResolutionMinutes)}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>First Response SLA Breaches</div>
              <div style={styles.statValue}>{firstResponseBreaches}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Resolution SLA Breaches</div>
              <div style={styles.statValue}>{resolutionBreaches}</div>
            </div>
          </div>

          <div style={styles.filterCard}>
            <h2 style={styles.sectionTitle}>Filter and Search</h2>
            <p style={styles.sectionSubtext}>
              Search by ticket id, title, description, or category and narrow the
              list by status and priority.
            </p>

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

          <div style={styles.resultText}>
            Showing <strong>{filteredTickets.length}</strong> ticket
            {filteredTickets.length !== 1 ? "s" : ""}
          </div>

          {loading ? (
            <div style={styles.loadingBox}>Loading all tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div style={styles.emptyBox}>No tickets found.</div>
          ) : (
            <div style={styles.tableWrap}>
              <div style={styles.tableScroller}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Title</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Priority</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Created By</th>
                      <th style={styles.th}>Assigned To</th>
                      <th style={styles.th}>First Response</th>
                      <th style={styles.th}>Resolution Time</th>
                      <th style={styles.th}>Created At</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>

                <tbody>
                  {filteredTickets.map((ticket) => {
                    const statusStyle = getStatusStyles(ticket.status);
                    const priorityStyle = getPriorityStyles(ticket.priority);

                    return (
                      <tr key={ticket.id}>
                        <td style={styles.td}>#{ticket.id}</td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: "800", marginBottom: "4px" }}>
                            {ticket.title}
                          </div>
                          <div style={{ color: colors.textMedium, fontSize: "13px" }}>
                            {ticket.description?.length > 70
                              ? `${ticket.description.slice(0, 70)}...`
                              : ticket.description}
                          </div>
                        </td>
                        <td style={styles.td}>{ticket.category || "N/A"}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.priorityPill,
                              backgroundColor: priorityStyle.bg,
                              color: priorityStyle.color,
                            }}
                          >
                            {ticket.priority || "N/A"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                            }}
                          >
                            {ticket.status?.replace("_", " ") || "N/A"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {ticket.createdByName
                            || (ticket.createdBy ? `User #${ticket.createdBy}` : "N/A")}
                        </td>
                        <td style={styles.td}>
                          {ticket.assignedToName
                            || (ticket.assignedTo ? getTechnicianLabel(ticket.assignedTo) : "Not assigned")}
                        </td>
                        <td style={styles.td}>
                          {ticket.timeToFirstResponseMinutes != null
                            ? formatDuration(ticket.timeToFirstResponseMinutes)
                            : "Pending"}
                        </td>
                        <td style={styles.td}>
                          {ticket.timeToResolutionMinutes != null
                            ? formatDuration(ticket.timeToResolutionMinutes)
                            : "Pending"}
                        </td>
                        <td style={styles.td}>{formatDate(ticket.createdAt)}</td>
                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            <Link
  to={`/tickets/admin/details/${ticket.id}`}
  style={styles.actionLink}
>
  Details
</Link>

                            <Link
  to={`/tickets/assign/${ticket.id}`}
  style={styles.actionLink}
>
  Assign
</Link>

                            <Link
  to={`/tickets/update-status/${ticket.id}`}
  style={styles.actionLink}
>
  Status
</Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminTickets;
