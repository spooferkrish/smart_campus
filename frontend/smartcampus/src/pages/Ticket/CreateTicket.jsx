import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const getResourceApiCandidates = () => {
  const baseURL = (API?.defaults?.baseURL ?? "").replace(/\/+$/, "");
  const nonApiBase = baseURL.replace(/\/api$/i, "");
  const candidates = ["/resources"];

  if (nonApiBase) {
    candidates.push(`${nonApiBase}/resources`);
  }

  return [...new Set(candidates)];
};

function CreateTicket() {
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
    success: "#16A34A",
    danger: "#DC2626",
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

  const MAX_FILES = 3;
  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  const initialForm = {
    title: "",
    description: "",
    category: "",
    priority: "",
    location: "",
    preferredContact: "",
    resourceHint: "",
  };

  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [createdTicket, setCreatedTicket] = useState(null);
  const [resourceOptions, setResourceOptions] = useState([]);
  const [resourceLoading, setResourceLoading] = useState(true);
  const [resourceError, setResourceError] = useState("");

  const fileInputRef = useRef(null);

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
        .filter(
          (resource) => String(resource?.status || "").toUpperCase() === "ACTIVE",
        )
        .map((resource) => (resource?.name ?? "").trim())
        .filter(Boolean);

      const uniqueNames = [...new Set(names)].sort((a, b) =>
        a.localeCompare(b),
      );

      setResourceOptions(uniqueNames);
      if (uniqueNames.length === 0) {
        setResourceError("No active resources available right now.");
      }
      setResourceLoading(false);
    };

    fetchResources();
  }, []);

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

      case "location":
        if (!value.trim()) return "Location is required.";
        if (value.trim().length < 3) return "Location must be at least 3 characters.";
        return "";

      case "preferredContact":
        if (!value.trim()) return "Preferred contact is required.";
        if (value.trim().length < 5) return "Enter a valid contact detail.";
        if (value.trim().length > 100) return "Preferred contact must be under 100 characters.";
        return "";

      case "resourceHint":
        if (value.trim().length > 80) return "Resource hint must be under 80 characters.";
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
      location: validateField("location", form.location),
      preferredContact: validateField("preferredContact", form.preferredContact),
      resourceHint: validateField("resourceHint", form.resourceHint),
    };
  }, [form]);

  const isFormValid = Object.values(errors).every((error) => !error);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitMessage("");
    setSubmitError("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const validateFiles = (fileList) => {
    const problems = [];
    const validFiles = [];

    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return { validFiles, problems };

    if (images.length + incoming.length > MAX_FILES) {
      problems.push(`You can upload up to ${MAX_FILES} images.`);
      return { validFiles, problems };
    }

    incoming.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        problems.push(`${file.name}: Invalid file type.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        problems.push(`${file.name}: Exceeds 5MB.`);
        return;
      }
      validFiles.push(file);
    });

    return { validFiles, problems };
  };

  const addFiles = (fileList) => {
    setImageError("");
    const { validFiles, problems } = validateFiles(fileList);

    if (problems.length) {
      setImageError(problems[0]);
      return;
    }

    if (validFiles.length) {
      const next = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...next]);
    }
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = [...prev];
      const removed = updated.splice(index, 1);
      if (removed[0]?.preview) URL.revokeObjectURL(removed[0].preview);
      return updated;
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setImageError("");
    setTouched({});
    setSubmitError("");
    setSubmitMessage("");
  };

  const handleCreateAnother = () => {
    setCreatedTicket(null);
    resetForm();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    scrollToTop();

    const allTouched = {
      title: true,
      description: true,
      category: true,
      priority: true,
      location: true,
      preferredContact: true,
      resourceHint: true,
    };
    setTouched(allTouched);
    setSubmitMessage("");
    setSubmitError("");

    if (!isFormValid) {
      setSubmitError("Please fix the highlighted fields before submitting.");
      return;
    }

    if (imageError) {
      setSubmitError(imageError);
      return;
    }

    if (!user?.id) {
      setSubmitError("Unable to determine current user. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category);
      formData.append("priority", form.priority);
      formData.append("createdBy", user.id);
      formData.append("location", form.location.trim());
      formData.append("preferredContact", form.preferredContact.trim());
      formData.append("resourceHint", form.resourceHint.trim());

      images.forEach((img) => {
        formData.append("images", img.file);
      });

      const response = await API.post("/tickets", formData);

      const returnedTicket = response?.data;

      setCreatedTicket({
        id: returnedTicket?.id ?? "Created",
        title: returnedTicket?.title ?? form.title.trim(),
        status: returnedTicket?.status ?? "OPEN",
      });

      setSubmitMessage("Ticket created successfully.");
      scrollToTop();

      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
      setImageError("");
    } catch (error) {
      console.error("Create ticket error:", error);
      setSubmitError(
        error?.response?.data?.message ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
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
    textarea: {
      width: "100%",
      minHeight: "130px",
      resize: "vertical",
      padding: "14px 16px",
      borderRadius: "14px",
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: colors.white,
      fontSize: "14px",
      color: colors.textDark,
      outline: "none",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
      fontFamily: "inherit",
      lineHeight: "1.6",
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
    successBox: {
      backgroundColor: "#F0FDF4",
      border: "1px solid #BBF7D0",
      color: colors.success,
      padding: "14px 16px",
      borderRadius: "14px",
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "18px",
    },
    errorBox: {
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      color: colors.danger,
      padding: "14px 16px",
      borderRadius: "14px",
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "18px",
    },
    dropZone: {
      border: `2px dashed ${dragActive ? colors.accentOrange : colors.borderLight}`,
      borderRadius: "16px",
      padding: "18px",
      backgroundColor: dragActive ? "#FFF6E5" : colors.bgLight,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    previewGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: "12px",
      marginTop: "12px",
    },
    previewCard: {
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "12px",
      backgroundColor: colors.white,
      overflow: "hidden",
      position: "relative",
    },
    previewImg: {
      width: "100%",
      height: "100px",
      objectFit: "cover",
      display: "block",
    },
    removeBtn: {
      position: "absolute",
      top: "6px",
      right: "6px",
      backgroundColor: colors.danger,
      color: colors.white,
      border: "none",
      borderRadius: "8px",
      padding: "4px 6px",
      fontSize: "11px",
      cursor: "pointer",
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
    successCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "0 16px 36px rgba(17, 24, 39, 0.06)",
    },
    successIcon: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      backgroundColor: "#ECFDF3",
      color: colors.success,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "30px",
      fontWeight: "800",
      marginBottom: "18px",
    },
    successTitle: {
      margin: 0,
      fontSize: "28px",
      fontWeight: "800",
      color: colors.textDark,
    },
    successText: {
      marginTop: "10px",
      color: colors.textMedium,
      fontSize: "15px",
      lineHeight: "1.8",
      marginBottom: "22px",
    },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "14px",
      marginBottom: "22px",
    },
    summaryBox: {
      backgroundColor: colors.bgLight,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "16px",
      padding: "16px",
    },
    summaryLabel: {
      fontSize: "12px",
      fontWeight: "700",
      color: colors.textMedium,
      textTransform: "uppercase",
      letterSpacing: "0.6px",
      marginBottom: "6px",
    },
    summaryValue: {
      fontSize: "16px",
      fontWeight: "800",
      color: colors.textDark,
      wordBreak: "break-word",
    },
    successActions: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      marginTop: "8px",
    },
  };

  const fieldStyle = (fieldName, isTextArea = false) => {
    const base = isTextArea ? styles.textarea : styles.input;
    return touched[fieldName] && errors[fieldName]
      ? { ...base, ...styles.inputError }
      : base;
  };

  if (createdTicket) {
    return (
      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.hero}>
            <h1 style={styles.heroTitle}>Ticket Submitted Successfully</h1>
            <p style={styles.heroText}>
              Your maintenance request has been recorded successfully. You can
              now track it from your tickets page or open the details page.
            </p>
          </div>

          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Ticket created successfully</h2>
            <p style={styles.successText}>
              Your issue has been submitted to the system. The current workflow
              status is set to <strong>OPEN</strong> and the support team can
              review it next.
            </p>

            <div style={styles.summaryGrid}>
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Ticket ID</div>
                <div style={styles.summaryValue}>#{createdTicket.id}</div>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Title</div>
                <div style={styles.summaryValue}>{createdTicket.title}</div>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Current Status</div>
                <div style={styles.summaryValue}>{createdTicket.status}</div>
              </div>
            </div>

            <div style={styles.successActions}>
              <Link to="/tickets/my" style={styles.primaryButton}>
                View My Tickets
              </Link>

              {createdTicket.id !== "Created" && (
                <Link
                  to={`/tickets/details/${createdTicket.id}`}
                  style={styles.clearButton}
                >
                  View Ticket Details
                </Link>
              )}

              <button
                type="button"
                style={styles.clearButton}
                onClick={handleCreateAnother}
              >
                Create Another Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Report a Campus Issue Quickly</h1>
          <p style={styles.heroText}>
            Submit maintenance and incident requests with clear details so the
            support team can respond faster. This form is designed to be simple,
            clean, and easy for students and staff to use.
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
            <h2 style={styles.sectionTitle}>Create Ticket</h2>
            <p style={styles.sectionText}>
              Fill the required details below. Use the category and priority
              dropdowns to help the support team understand the issue faster.
            </p>

            {submitMessage && <div style={styles.successBox}>{submitMessage}</div>}
            {submitError && <div style={styles.errorBox}>{submitError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div style={styles.formGrid}>
                <div style={{ ...styles.group, ...styles.fullWidth }}>
                  <div style={styles.labelRow}>
                    <label style={styles.label} htmlFor="title">
                      Ticket Title
                    </label>
                    <span style={styles.helper}>
                      {form.title.trim().length}/100
                    </span>
                  </div>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Example: Projector not working in Lab 3"
                    value={form.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={fieldStyle("title")}
                  />
                  {touched.title && errors.title && (
                    <span style={styles.errorText}>{errors.title}</span>
                  )}
                </div>

                <div style={{ ...styles.group, ...styles.fullWidth }}>
                  <div style={styles.labelRow}>
                    <label style={styles.label} htmlFor="description">
                      Description
                    </label>
                    <span style={styles.helper}>
                      {form.description.trim().length}/500
                    </span>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe the issue clearly. Mention what happened, where it happened, and what is affected."
                    value={form.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={fieldStyle("description", true)}
                  />
                  {touched.description && errors.description && (
                    <span style={styles.errorText}>{errors.description}</span>
                  )}
                </div>

                <div style={styles.group}>
                  <label style={styles.label} htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={fieldStyle("category")}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {touched.category && errors.category && (
                    <span style={styles.errorText}>{errors.category}</span>
                  )}
                </div>

                <div style={styles.group}>
                  <label style={styles.label} htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={fieldStyle("priority")}
                  >
                    <option value="">Select priority</option>
                    {priorityOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {touched.priority && errors.priority && (
                    <span style={styles.errorText}>{errors.priority}</span>
                  )}
                </div>

                <div style={styles.group}>
                  <label style={styles.label} htmlFor="location">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Example: Lab 3"
                    value={form.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={fieldStyle("location")}
                  />
                  {touched.location && errors.location && (
                    <span style={styles.errorText}>{errors.location}</span>
                  )}
                </div>

                <div style={styles.group}>
                  <label style={styles.label} htmlFor="preferredContact">
                    Preferred Contact
                  </label>
                  <input
                    id="preferredContact"
                    name="preferredContact"
                    type="text"
                    placeholder="Example: 0771234567 or student@sliit.lk"
                    value={form.preferredContact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={fieldStyle("preferredContact")}
                  />
                  {touched.preferredContact && errors.preferredContact && (
                    <span style={styles.errorText}>
                      {errors.preferredContact}
                    </span>
                  )}
                </div>

                <div style={styles.group}>
                  <div style={styles.labelRow}>
                    <label style={styles.label} htmlFor="resourceHint">
                      Related Resource
                    </label>
                    <span style={styles.helper}>
                      {resourceLoading ? "Loading" : `${resourceOptions.length} available`}
                    </span>
                  </div>
                  <select
                    id="resourceHint"
                    name="resourceHint"
                    value={form.resourceHint}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={fieldStyle("resourceHint")}
                    disabled={resourceLoading || submitting}
                  >
                    <option value="">
                      {resourceLoading ? "Loading resources..." : "Select a resource (optional)"}
                    </option>
                    {resourceOptions.map((resourceName) => (
                      <option key={resourceName} value={resourceName}>
                        {resourceName}
                      </option>
                    ))}
                  </select>
                  {resourceError ? (
                    <span style={styles.errorText}>{resourceError}</span>
                  ) : null}
                  {touched.resourceHint && errors.resourceHint && (
                    <span style={styles.errorText}>{errors.resourceHint}</span>
                  )}
                </div>

                <div style={{ ...styles.group, ...styles.fullWidth }}>
                  <div style={styles.labelRow}>
                    <label style={styles.label}>Upload Images (optional)</label>
                    <span style={styles.helper}>
                      {images.length}/{MAX_FILES} selected
                    </span>
                  </div>

                  <div
                    style={styles.dropZone}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div style={{ color: colors.textMedium, fontSize: "14px" }}>
                      Drag & drop images here, or <strong>click to browse</strong>.
                      <br />
                      JPG, PNG, WEBP up to 5MB each.
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      multiple
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </div>

                  {imageError && (
                    <span style={styles.errorText}>{imageError}</span>
                  )}

                  {images.length > 0 && (
                    <div style={styles.previewGrid}>
                      {images.map((img, index) => (
                        <div key={img.preview} style={styles.previewCard}>
                          <img
                            src={img.preview}
                            alt={`preview-${index}`}
                            style={styles.previewImg}
                          />
                          <button
                            type="button"
                            style={styles.removeBtn}
                            onClick={() => removeImage(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.noteBox}>
                <h3 style={styles.noteTitle}>Current Integration Note</h3>
                <p style={styles.noteText}>
                  Related Resource now loads dynamically from the Resources
                  module, similar to the Booking flow, so ticket creation is
                  no longer using a hardcoded resource field.
                </p>
              </div>

              <div style={styles.actionRow}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Ticket"}
                  </button>

                  <button
                    type="button"
                    style={styles.clearButton}
                    onClick={resetForm}
                  >
                    Clear Form
                  </button>
                </div>

                <span style={styles.helper}>
                  Required: title, description, category, priority, location,
                  preferred contact
                </span>
              </div>
            </form>
          </div>

          <div>
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Quick Guidance</h3>
              <ul style={styles.sideList}>
                <li>Choose the most accurate category.</li>
                <li>Use HIGH priority only for urgent issues.</li>
                <li>Give a clear location for faster support.</li>
                <li>Write the description in simple and direct language.</li>
              </ul>
            </div>

            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Form Summary</h3>
              <div style={styles.statGrid}>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Category</div>
                  <div style={styles.statValue}>
                    {form.category || "Not selected"}
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Priority</div>
                  <div style={styles.statValue}>
                    {form.priority || "Not selected"}
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Location</div>
                  <div style={styles.statValue}>
                    {form.location.trim() || "Not entered"}
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Related Resource</div>
                  <div style={styles.statValue}>
                    {form.resourceHint || "Not selected"}
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Status After Create</div>
                  <div style={styles.statValue}>OPEN</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;