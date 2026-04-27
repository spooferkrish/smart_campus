import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const toDatetimeLocal = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.length >= 16) return value.slice(0, 16);
  return value;
};

const toDatetimeLocalMin = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const resolveEndMin = (startTime, minNow) => {
  if (!startTime) return minNow;
  return startTime > minNow ? startTime : minNow;
};

const getResourceApiCandidates = () => {
  const baseURL = (API?.defaults?.baseURL ?? "").replace(/\/+$/, "");
  const nonApiBase = baseURL.replace(/\/api$/i, "");
  const candidates = ["/resources"];

  if (nonApiBase) {
    candidates.push(`${nonApiBase}/resources`);
  }

  return [...new Set(candidates)];
};

function UpdateBooking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [booking, setBooking] = useState({
    resourceName: "",
    purpose: "",
    bookedBy: "",
    attendees: "",
    startTime: "",
    endTime: "",
  });
  const [touched, setTouched] = useState({
    startTime: false,
    endTime: false,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [minNow, setMinNow] = useState(() => toDatetimeLocalMin());
  const [resourceOptions, setResourceOptions] = useState([]);
  const [resourceLoading, setResourceLoading] = useState(true);
  const [resourceError, setResourceError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const minEnd = resolveEndMin(booking.startTime, minNow);
  const startTimeError =
    !submitting &&
    touched.startTime &&
    booking.startTime &&
    booking.startTime < minNow
      ? "Please select a future start time."
      : "";
  const endTimeError =
    !submitting &&
    touched.endTime &&
    booking.endTime &&
    booking.endTime < minEnd
      ? "Please select a future end time."
      : "";

  const isValid = useMemo(() => {
    return (
      booking.resourceName.trim() &&
      booking.purpose.trim() &&
      booking.bookedBy.trim() &&
      booking.attendees !== "" &&
      Number(booking.attendees) > 0 &&
      booking.startTime &&
      booking.endTime
    );
  }, [booking]);

  const resourceSelectOptions = useMemo(() => {
    const allNames = [...resourceOptions];
    const selectedName = (booking.resourceName ?? "").trim();

    if (selectedName && !allNames.includes(selectedName)) {
      allNames.push(selectedName);
    }

    return allNames.sort((a, b) => a.localeCompare(b));
  }, [resourceOptions, booking.resourceName]);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get(`/bookings/${id}`);
        const data = response.data;

        setBooking({
          resourceName: data.resourceName ?? "",
          purpose: data.purpose ?? "",
          bookedBy: data.bookedBy ?? "",
          attendees: data.attendees ?? "",
          startTime: toDatetimeLocal(data.startTime),
          endTime: toDatetimeLocal(data.endTime),
        });
      } catch (e) {
        console.error("Error loading booking", e);
        setError("Couldn't load booking. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  useEffect(() => {
    const fetchResources = async () => {
      setResourceLoading(true);
      setResourceError("");

      const endpoints = getResourceApiCandidates();
      let resourceList = null;

      for (const endpoint of endpoints) {
        try {
          const response = await API.get(endpoint);
          if (Array.isArray(response.data)) {
            resourceList = response.data;
            break;
          }
        } catch {
          // Try next endpoint candidate.
        }
      }

      if (!resourceList) {
        setResourceOptions([]);
        setResourceError("Couldn't load resources. Please try again.");
        setResourceLoading(false);
        return;
      }

      const names = resourceList
        .map((resource) => (resource?.name ?? "").trim())
        .filter(Boolean);

      const uniqueNames = [...new Set(names)].sort((a, b) =>
        a.localeCompare(b),
      );

      setResourceOptions(uniqueNames);
      setResourceLoading(false);
    };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const minNowValue = toDatetimeLocalMin();

    if (name === "attendees") {
      const digitsOnly = value.replace(/[^\d]/g, "");
      setBooking((prev) => ({
        ...prev,
        attendees: digitsOnly,
      }));
      return;
    }

    if (name === "startTime") {
      const safeStart = value && value < minNowValue ? minNowValue : value;
      const resolvedMinEnd = resolveEndMin(safeStart, minNowValue);

      setMinNow(minNowValue);
      setTouched((prev) => ({ ...prev, startTime: true }));
      setBooking((prev) => ({
        ...prev,
        startTime: safeStart,
        endTime: prev.endTime && prev.endTime < resolvedMinEnd ? "" : prev.endTime,
      }));
      return;
    }

    if (name === "endTime") {
      const resolvedMinEnd = resolveEndMin(booking.startTime, minNowValue);
      const safeEnd = value && value < resolvedMinEnd ? resolvedMinEnd : value;

      setMinNow(minNowValue);
      setTouched((prev) => ({ ...prev, endTime: true }));
      setBooking((prev) => ({
        ...prev,
        endTime: safeEnd,
      }));
      return;
    }

    setBooking({
      ...booking,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid || submitting) return;

    setSubmitting(true);

    try {
      const payload = {
        ...booking,
        attendees: Number(booking.attendees),
      };
      await API.put(`/bookings/${id}`, payload);
      setToast({ show: true, message: "Booking updated successfully.", type: "success" });
      window.setTimeout(() => navigate("/bookings"), 800);
    } catch (e) {
      console.error("Error updating booking", e);
      setToast({
        show: true,
        message: e.response?.data?.message || "Error updating booking",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const colors = {
    primaryDark: "#1A1F5A",
    primaryGradientEnd: "#2A3080",
    accentOrange: "#F5A623",
    textDark: "#1A1F5A",
    textMedium: "#6B7BA4",
    textLight: "#C8D9FF",
    bgLight: "#F7F9FF",
    bgStats: "#F0F4FF",
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
      maxWidth: "1100px",
      margin: "0 auto",
    },
    hero: {
      background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryGradientEnd} 100%)`,
      borderRadius: "24px",
      padding: "32px",
      color: colors.white,
      marginBottom: "28px",
      boxShadow: "0 18px 40px rgba(26, 31, 90, 0.16)",
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
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "1.45fr 0.85fr",
      gap: "24px",
      alignItems: "start",
    },
    formCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "22px",
      padding: "28px",
      boxShadow: "0 16px 36px rgba(17, 24, 39, 0.06)",
    },
    sideCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "22px",
      padding: "24px",
      boxShadow: "0 16px 36px rgba(17, 24, 39, 0.05)",
      marginBottom: "18px",
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
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "18px",
      marginTop: "24px",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    group: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    labelRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "8px",
    },
    label: {
      fontSize: "14px",
      fontWeight: "700",
      color: colors.textDark,
    },
    helper: {
      fontSize: "12px",
      color: colors.textMedium,
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: "14px",
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: colors.white,
      fontSize: "14px",
      color: colors.textDark,
      outline: "none",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
    },
    inputError: {
      border: `1px solid ${colors.danger}`,
      backgroundColor: "#FFF7F7",
    },
    errorText: {
      fontSize: "12px",
      color: colors.danger,
      marginTop: "-2px",
    },
    noteBox: {
      backgroundColor: colors.bgStats,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "16px",
      padding: "16px",
      marginTop: "22px",
    },
    noteTitle: {
      margin: 0,
      fontSize: "15px",
      fontWeight: "700",
      color: colors.textDark,
    },
    noteText: {
      marginTop: "8px",
      marginBottom: 0,
      fontSize: "13px",
      color: colors.textMedium,
      lineHeight: "1.7",
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
    actionRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      marginTop: "26px",
    },
    primaryButton: {
      border: "none",
      borderRadius: "14px",
      backgroundColor: submitting ? "#f7bd58" : colors.accentOrange,
      color: colors.white,
      fontSize: "15px",
      fontWeight: "800",
      padding: "14px 24px",
      cursor: submitting ? "not-allowed" : "pointer",
      minWidth: "180px",
      boxShadow: "0 12px 24px rgba(245, 166, 35, 0.24)",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    clearButton: {
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "14px",
      backgroundColor: colors.white,
      color: colors.textDark,
      fontSize: "14px",
      fontWeight: "700",
      padding: "14px 20px",
      cursor: "pointer",
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
    sideTitle: {
      margin: 0,
      color: colors.textDark,
      fontSize: "18px",
      fontWeight: "800",
    },
    sideList: {
      margin: "14px 0 0 0",
      paddingLeft: "18px",
      color: colors.textMedium,
      lineHeight: "1.8",
      fontSize: "14px",
    },
    statGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginTop: "18px",
    },
    statItem: {
      backgroundColor: colors.bgLight,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "16px",
      padding: "14px",
    },
    statLabel: {
      fontSize: "12px",
      fontWeight: "700",
      color: colors.textMedium,
      textTransform: "uppercase",
      letterSpacing: "0.6px",
      marginBottom: "6px",
    },
    statValue: {
      fontSize: "16px",
      fontWeight: "800",
      color: colors.textDark,
    },
  };

  const fieldStyle = (fieldName) => {
    const base = styles.input;
    const hasError =
      (fieldName === "startTime" && startTimeError) ||
      (fieldName === "endTime" && endTimeError);
    return touched[fieldName] && hasError
      ? { ...base, ...styles.inputError }
      : base;
  };

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
          <h1 style={styles.heroTitle}>Update Your Booking</h1>
          <p style={styles.heroText}>
            Adjust the resource, timing, or details for your existing booking.
            Keep the time window valid before saving.
          </p>
        </div>

        <div
          style={{
            ...styles.contentGrid,
            gridTemplateColumns:
              typeof window !== "undefined" && window.innerWidth < 980
                ? "1fr"
                : styles.contentGrid.gridTemplateColumns,
          }}
        >
          <div style={styles.formCard}>
            <h2 style={styles.sectionTitle}>Update Booking</h2>
            <p style={styles.sectionText}>Update your booking details below.</p>

            {error ? <div style={styles.errorBox}>{error}</div> : null}

            <form onSubmit={handleSubmit} noValidate>
              <div style={styles.formGrid}>
                <div style={{ ...styles.group, ...styles.fullWidth }}>
                  <div style={styles.labelRow}>
                    <label style={styles.label} htmlFor="resourceName">
                      Resource Name
                    </label>
                    <span style={styles.helper}>
                      {resourceLoading ? "Loading" : `${resourceSelectOptions.length} available`}
                    </span>
                  </div>
                  <select
                    id="resourceName"
                    name="resourceName"
                    value={booking.resourceName}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    disabled={loading || resourceLoading || submitting}
                  >
                    <option value="">
                      {resourceLoading ? "Loading resources..." : "Select a resource"}
                    </option>
                    {resourceSelectOptions.map((resourceName) => (
                      <option key={resourceName} value={resourceName}>
                        {resourceName}
                      </option>
                    ))}
                  </select>
                  {resourceError ? (
                    <span style={styles.errorText}>{resourceError}</span>
                  ) : null}
                </div>

                <div style={styles.group}>
                  <label style={styles.label} htmlFor="bookedBy">
                    Booked By (Name)
                  </label>
                  <input
                    id="bookedBy"
                    type="text"
                    name="bookedBy"
                    value={booking.bookedBy}
                    onChange={handleChange}
                    placeholder="e.g., Nuwan Perera"
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.group}>
                  <label style={styles.label} htmlFor="attendees">
                    Attendees
                  </label>
                  <input
                    id="attendees"
                    type="number"
                    name="attendees"
                    value={booking.attendees}
                    onChange={handleChange}
                    min={1}
                    step={1}
                    inputMode="numeric"
                    placeholder="e.g., 30"
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div style={{ ...styles.group, ...styles.fullWidth }}>
                  <label style={styles.label} htmlFor="purpose">
                    Purpose
                  </label>
                  <input
                    id="purpose"
                    type="text"
                    name="purpose"
                    value={booking.purpose}
                    onChange={handleChange}
                    placeholder="e.g., Workshop / Lecture"
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.group}>
                  <label style={styles.label} htmlFor="startTime">
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    name="startTime"
                    value={booking.startTime}
                    onChange={handleChange}
                    onFocus={() => setMinNow(toDatetimeLocalMin())}
                    min={minNow}
                    style={fieldStyle("startTime")}
                    required
                    disabled={loading}
                  />
                  {startTimeError ? (
                    <span style={styles.errorText}>{startTimeError}</span>
                  ) : null}
                </div>

                <div style={styles.group}>
                  <label style={styles.label} htmlFor="endTime">
                    End Time
                  </label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    name="endTime"
                    value={booking.endTime}
                    onChange={handleChange}
                    onFocus={() => setMinNow(toDatetimeLocalMin())}
                    min={minEnd}
                    style={fieldStyle("endTime")}
                    required
                    disabled={loading}
                  />
                  {endTimeError ? (
                    <span style={styles.errorText}>{endTimeError}</span>
                  ) : null}
                </div>
              </div>

              <div style={styles.noteBox}>
                <h3 style={styles.noteTitle}>Update Tips</h3>
                <p style={styles.noteText}>
                  Ensure the start and end times are in the future. If you
                  change the start time, verify the end time again.
                </p>
              </div>

              <div style={styles.actionRow}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    style={styles.clearButton}
                    onClick={() => navigate("/bookings")}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={!isValid || submitting || loading}
                  >
                    {submitting ? "Updating..." : "Update Booking"}
                  </button>
                </div>

                <span style={styles.helper}>
                  Required: resource, booked by, attendees, purpose, start, end
                </span>
              </div>
            </form>
          </div>

          <div>
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Quick Guidance</h3>
              <ul style={styles.sideList}>
                <li>Choose a resource that fits your session.</li>
                <li>Keep attendee counts accurate.</li>
                <li>Double-check the updated timing.</li>
              </ul>
            </div>

            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Current Summary</h3>
              <div style={styles.statGrid}>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Resource</div>
                  <div style={styles.statValue}>
                    {booking.resourceName || "Not selected"}
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Attendees</div>
                  <div style={styles.statValue}>
                    {booking.attendees || "Not entered"}
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Start</div>
                  <div style={styles.statValue}>
                    {booking.startTime || "Not set"}
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>End</div>
                  <div style={styles.statValue}>{booking.endTime || "Not set"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateBooking;
