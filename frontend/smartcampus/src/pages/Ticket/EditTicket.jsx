import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

function EditTicket() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    danger: "#DC2626",
    warning: "#F59E0B",
  };

  const categoryOptions = [
    "ELECTRICAL",
    "NETWORK",
    "EQUIPMENT",
    "CLEANING",
    "FURNITURE",
    "OTHER",
  ];

  const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

  const [ticket, setTicket] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setSubmitError("");

      const response = await API.get(`/tickets/${id}`);
      const data = response.data;
      setTicket(data);
      setForm({
        title: data?.title || "",
        description: data?.description || "",
        category: data?.category || "",
        priority: data?.priority || "",
      });
    } catch (error) {
      console.error("Failed to load ticket:", error);
      setSubmitError("Unable to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const isEditable =
    ticket && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED";

  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Title is required.";
        if (value.trim().length < 5) return "Title must be at least 5 characters.";
        if (value.trim().length > 100) return "Title must be under 100 characters.";
        return "";
      case "description":
        if (!value.trim()) return "Description is required.";
        if (value.trim().length < 15) return "Description must be at least 15 characters.";
        if (value.trim().length > 500) return "Description must be under 500 characters.";
        return "";
      case "category":
        if (!value) return "Please select a category.";
        return "";
      case "priority":
        if (!value) return "Please select a priority.";
        return "";
      default:
        return "";
    }
  };

  const errors = useMemo(() => {
    return {
      title: validateField("title", form.title),
      description: validateField("description", form.description),
      category: validateField("category", form.category),
      priority: validateField("priority", form.priority),
    };
  }, [form]);

  const isFormValid = Object.values(errors).every((error) => !error);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError("");
    setSubmitMessage("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const fieldStyle = (fieldName, isTextArea = false) => {
    const base = isTextArea ? styles.textarea : styles.input;
    return touched[fieldName] && errors[fieldName]
      ? { ...base, ...styles.inputError }
      : base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {
      title: true,
      description: true,
      category: true,
      priority: true,
    };
    setTouched(allTouched);
    setSubmitError("");
    setSubmitMessage("");

    if (!isFormValid) {
      setSubmitError("Please fix the highlighted fields before saving.");
      return;
    }

    if (!isEditable) {
      setSubmitError("Resolved tickets cannot be edited.");
      return;
    }

    try {
      setSubmitting(true);

      await API.put(`/tickets/${id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
      });

      setSubmitMessage("Ticket updated successfully.");
      setTimeout(() => {
        navigate(`/tickets/details/${id}`);
      }, 900);
    } catch (error) {
      console.error("Update ticket error:", error);
      setSubmitError(
        error?.response?.data?.message ||
          "Failed to update ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${colors.bgLight} 0%, #ffffff 100%)`,
      padding: "36px 22px 60px",
    },
    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "22px",
    },
    backLink: {
      textDecoration: "none",
      color: colors.primaryDark,
      fontSize: "14px",
      fontWeight: "800",
    },
    heroCard: {
      background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryGradientEnd} 100%)`,
      borderRadius: "24px",
      padding: "30px",
      color: colors.white,
      boxShadow: "0 20px 50px rgba(26, 31, 90, 0.18)",
      marginBottom: "26px",
    },
    heroTitle: {
      margin: 0,
      fontSize: "32px",
      fontWeight: "800",
      lineHeight: "1.2",
    },
    heroText: {
      marginTop: "12px",
      marginBottom: 0,
      color: colors.textLight,
      fontSize: "15px",
      lineHeight: "1.7",
    },
    card: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "22px",
      padding: "26px",
      boxShadow: "0 16px 36px rgba(17, 24, 39, 0.06)",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "800",
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
      marginTop: "22px",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    label: {
      fontSize: "14px",
      fontWeight: "700",
      color: colors.textDark,
      marginBottom: "8px",
      display: "block",
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
      boxSizing: "border-box",
    },
    inputError: {
      border: `1px solid ${colors.danger}`,
      backgroundColor: "#FFF7F7",
    },
    textarea: {
      width: "100%",
      minHeight: "140px",
      resize: "vertical",
      padding: "14px 16px",
      borderRadius: "14px",
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: colors.white,
      fontSize: "14px",
      color: colors.textDark,
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      lineHeight: "1.7",
    },
    errorText: {
      marginTop: "6px",
      fontSize: "12px",
      color: colors.danger,
    },
    notice: {
      backgroundColor: "#FEF3C7",
      border: "1px solid #FDE68A",
      borderRadius: "14px",
      padding: "14px 16px",
      color: colors.warning,
      fontWeight: "700",
      fontSize: "13px",
      marginTop: "18px",
    },
    successBox: {
      backgroundColor: "#F0FDF4",
      border: "1px solid #BBF7D0",
      color: colors.success,
      padding: "14px 16px",
      borderRadius: "14px",
      fontSize: "14px",
      fontWeight: "600",
      marginTop: "18px",
    },
    errorBox: {
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      color: colors.danger,
      padding: "14px 16px",
      borderRadius: "14px",
      fontSize: "14px",
      fontWeight: "600",
      marginTop: "18px",
    },
    actionRow: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      marginTop: "24px",
      alignItems: "center",
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
      minWidth: "160px",
      boxShadow: "0 12px 24px rgba(245, 166, 35, 0.24)",
    },
    secondaryButton: {
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "14px",
      backgroundColor: colors.white,
      color: colors.textDark,
      fontSize: "14px",
      fontWeight: "700",
      padding: "14px 20px",
      cursor: "pointer",
      textDecoration: "none",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>Loading ticket details...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <Link to="/tickets/my" style={styles.backLink}>
            ← Back to My Tickets
          </Link>

          <Link to={`/tickets/details/${id}`} style={styles.secondaryButton}>
            View Details
          </Link>
        </div>

        <div style={styles.heroCard}>
          <h1 style={styles.heroTitle}>Edit Ticket</h1>
          <p style={styles.heroText}>
            Update the ticket details while the request is still active. Resolved
            tickets cannot be edited.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Ticket Details</h2>
          <p style={styles.sectionText}>
            Make your changes and save. The support team will see the updated
            information immediately.
          </p>

          {!isEditable && (
            <div style={styles.notice}>
              This ticket is {ticket?.status?.replace("_", " ")?.toLowerCase()} and
              can no longer be edited.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.fullWidth}>
                <label style={styles.label}>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={fieldStyle("title")}
                  placeholder="Enter a short title"
                  disabled={!isEditable}
                />
                {touched.title && errors.title && (
                  <div style={styles.errorText}>{errors.title}</div>
                )}
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={fieldStyle("description", true)}
                  placeholder="Describe the issue in detail"
                  disabled={!isEditable}
                />
                {touched.description && errors.description && (
                  <div style={styles.errorText}>{errors.description}</div>
                )}
              </div>

              <div>
                <label style={styles.label}>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={fieldStyle("category")}
                  disabled={!isEditable}
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {touched.category && errors.category && (
                  <div style={styles.errorText}>{errors.category}</div>
                )}
              </div>

              <div>
                <label style={styles.label}>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={fieldStyle("priority")}
                  disabled={!isEditable}
                >
                  <option value="">Select priority</option>
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {touched.priority && errors.priority && (
                  <div style={styles.errorText}>{errors.priority}</div>
                )}
              </div>
            </div>

            {submitError && <div style={styles.errorBox}>{submitError}</div>}
            {submitMessage && <div style={styles.successBox}>{submitMessage}</div>}

            <div style={styles.actionRow}>
              <button type="submit" style={styles.primaryButton} disabled={!isEditable || submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <Link to="/tickets/my" style={styles.secondaryButton}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditTicket;
