import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function TicketComments() {
  const { id } = useParams();
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
    info: "#2563EB",
  };

  const [comments, setComments] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [flash, setFlash] = useState({ type: "", message: "" });

  const [newComment, setNewComment] = useState("");
  const [newCommentError, setNewCommentError] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = user?.role === "ADMIN";
  const isTechnician = user?.role === "TECHNICIAN";
  const showStatusUpdateTab = isAdmin || isTechnician;
  const showAssignTab = isAdmin;
  const canAssign = user?.role === "ADMIN" || user?.role === "TECHNICIAN";
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

  const validateComment = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Comment cannot be empty.";
    if (trimmed.length < 3) return "Comment must be at least 3 characters.";
    if (trimmed.length > 500) return "Comment must be 500 characters or less.";
    return "";
  };

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const response = await API.get(`/tickets/${id}/comments`);
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setPageError("Unable to load comments for this ticket.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTicket = useCallback(async () => {
    try {
      const response = await API.get(`/tickets/${id}`);
      setTicket(response.data || null);
    } catch (error) {
      console.error("Failed to fetch ticket details:", error);
      setTicket(null);
    }
  }, [id]);

  useEffect(() => {
    fetchComments();
    fetchTicket();
  }, [fetchComments, fetchTicket]);

  useEffect(() => {
    // Keep comments synced between user/admin views without manual refresh.
    const intervalId = window.setInterval(() => {
      fetchComments();
    }, 5000);

    const handleFocus = () => {
      fetchComments();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchComments]);

  useEffect(() => {
    if (!flash.message) return undefined;

    const timeoutId = window.setTimeout(() => {
      setFlash({ type: "", message: "" });
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [flash]);

  const commentsByParent = useMemo(() => {
    const map = new Map();

    comments.forEach((comment) => {
      const parentKey = comment.parentCommentId ?? "ROOT";
      if (!map.has(parentKey)) {
        map.set(parentKey, []);
      }
      map.get(parentKey).push(comment);
    });

    return map;
  }, [comments]);

  const totalComments = comments.length;
  const totalReplies = comments.filter((item) => item.parentCommentId != null).length;
  const topLevelCount = totalComments - totalReplies;
  const navSections = [
    { to: `/tickets/details/${id}`, label: "Ticket Details", active: false },
    { to: `/tickets/comments/${id}`, label: "Comments", active: true },
    ...(showAssignTab
      ? [{ to: `/tickets/assign/${id}`, label: "Assign Technician", active: false }]
      : []),
    ...(showStatusUpdateTab
      ? [{ to: `/tickets/update-status/${id}`, label: "Status Update", active: false }]
      : []),
    { to: ticketsListPath, label: ticketsListLabel, active: false },
  ];
  const bannerTitle = ticket?.title?.trim() || `Ticket #${id}`;

  const formatDate = (value) => {
    if (!value) return "No date";
    return new Date(value).toLocaleString();
  };

  const canModify = (comment) => {
    if (!user?.id) return false;
    return Number(comment.commentedBy) === Number(user.id);
  };

  const clearEditors = () => {
    setEditingId(null);
    setEditText("");
    setEditError("");

    setReplyingTo(null);
    setReplyText("");
    setReplyError("");
  };

  const handleCreateComment = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setPageError("Unable to determine current user. Please log in again.");
      return;
    }

    const validationMessage = validateComment(newComment);
    setNewCommentError(validationMessage);
    if (validationMessage) return;

    try {
      setCreating(true);
      setPageError("");

      await API.post(`/tickets/${id}/comments`, {
        comment: newComment.trim(),
        commentedBy: user.id,
      });

      setNewComment("");
      setNewCommentError("");
      setFlash({ type: "success", message: "Comment added successfully." });
      await fetchComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
      setPageError(error?.response?.data?.message || "Failed to add comment.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (comment) => {
    setReplyingTo(null);
    setReplyText("");
    setReplyError("");

    setEditingId(comment.id);
    setEditText(comment.comment || "");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditError("");
  };

  const handleSaveEdit = async (commentId) => {
    const validationMessage = validateComment(editText);
    setEditError(validationMessage);
    if (validationMessage) return;

    try {
      setSavingEdit(true);
      setPageError("");

      await API.put(`/tickets/${id}/comments/${commentId}`, {
        comment: editText.trim(),
      });

      setFlash({ type: "success", message: "Comment updated." });
      cancelEdit();
      await fetchComments();
    } catch (error) {
      console.error("Failed to update comment:", error);
      setEditError(error?.response?.data?.message || "Failed to update comment.");
    } finally {
      setSavingEdit(false);
    }
  };

  const startReply = (commentId) => {
    setEditingId(null);
    setEditText("");
    setEditError("");

    setReplyingTo(commentId);
    setReplyText("");
    setReplyError("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
    setReplyError("");
  };

  const handleSaveReply = async (commentId) => {
    if (!user?.id) {
      setPageError("Unable to determine current user. Please log in again.");
      return;
    }

    const validationMessage = validateComment(replyText);
    setReplyError(validationMessage);
    if (validationMessage) return;

    try {
      setSavingReply(true);
      setPageError("");

      await API.post(`/tickets/${id}/comments/${commentId}/reply`, {
        comment: replyText.trim(),
        commentedBy: user.id,
      });

      setFlash({ type: "success", message: "Reply added." });
      cancelReply();
      await fetchComments();
    } catch (error) {
      console.error("Failed to reply:", error);
      setReplyError(error?.response?.data?.message || "Failed to add reply.");
    } finally {
      setSavingReply(false);
    }
  };

  const handleDeleteComment = async (comment) => {
    try {
      setDeletingId(comment.id);
      setPageError("");

      await API.delete(`/tickets/${id}/comments/${comment.id}`);

      if (editingId === comment.id || replyingTo === comment.id) {
        clearEditors();
      }

      setFlash({ type: "success", message: "Comment deleted." });
      await fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setPageError(error?.response?.data?.message || "Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderComment = (comment, depth = 0) => {
    const replies = commentsByParent.get(comment.id) || [];
    const isOwnComment = Number(comment.commentedBy) === Number(user?.id);
    const displayName =
      comment.commentedByName ||
      (isOwnComment && user?.name ? user.name : null) ||
      `User #${comment.commentedBy}`;
    const roleLabel = String(comment.commentedByRole || (isOwnComment ? user?.role : "USER") || "USER").toUpperCase();
    const isReply = depth > 0;
    const isAdminReply = isReply && roleLabel === "ADMIN";

    const tagColor =
      roleLabel === "ADMIN"
        ? colors.info
        : roleLabel === "TECHNICIAN"
          ? colors.success
          : colors.primaryDark;

    const isEditing = editingId === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <div
        key={comment.id}
        style={{
          ...styles.commentCard,
          backgroundColor: isAdminReply ? "#F4F8FF" : styles.commentCard.backgroundColor,
          marginLeft: isReply ? `${Math.min(depth, 3) * 20}px` : 0,
          borderLeft: isReply ? `3px solid ${colors.borderLight}` : styles.commentCard.border,
        }}
      >
        <div style={styles.commentAvatar}>
          {(displayName || "U")
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div style={styles.commentBody}>
          <div style={styles.commentTop}>
            <div style={styles.commentMeta}>
              <div style={styles.commentUser}>{isOwnComment ? `${displayName} (You)` : displayName}</div>
              <div style={styles.commentTagRow}>
                <span style={{ ...styles.rolePill, backgroundColor: tagColor }}>{roleLabel}</span>
                {isAdminReply ? <span style={styles.adminReplyPill}>Admin Reply</span> : null}
                {comment.edited ? <span style={styles.editedPill}>Edited</span> : null}
              </div>
            </div>

            <div style={styles.commentTime}>{formatDate(comment.updatedAt || comment.createdAt)}</div>
          </div>

          {isEditing ? (
            <div style={styles.editorWrap}>
              <textarea
                value={editText}
                onChange={(event) => {
                  const value = event.target.value;
                  setEditText(value);
                  setEditError(validateComment(value));
                }}
                style={styles.inlineTextarea}
                placeholder="Update your comment"
              />
              <div style={styles.inlineMetaRow}>
                <span style={styles.charCount}>{editText.length}/500</span>
                {editError ? <span style={styles.fieldErrorText}>{editError}</span> : null}
              </div>
              <div style={styles.inlineActions}>
                <button
                  type="button"
                  style={styles.primaryButton}
                  disabled={savingEdit}
                  onClick={() => handleSaveEdit(comment.id)}
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
                <button type="button" style={styles.secondaryButton} onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={styles.commentText}>{comment.comment || "No comment text."}</p>
          )}

          <div style={styles.commentActions}>
            {canModify(comment) ? (
              <button type="button" style={styles.ghostButton} onClick={() => startEdit(comment)}>
                Edit
              </button>
            ) : null}

            {canModify(comment) ? (
              <button
                type="button"
                style={{ ...styles.ghostButton, color: colors.danger }}
                disabled={deletingId === comment.id}
                onClick={() => handleDeleteComment(comment)}
              >
                {deletingId === comment.id ? "Deleting..." : "Delete"}
              </button>
            ) : null}

            {isAdmin ? (
              <button type="button" style={styles.ghostButton} onClick={() => startReply(comment.id)}>
                Reply
              </button>
            ) : null}
          </div>

          {isReplying ? (
            <div style={styles.replyBox}>
              <textarea
                value={replyText}
                onChange={(event) => {
                  const value = event.target.value;
                  setReplyText(value);
                  setReplyError(validateComment(value));
                }}
                style={styles.inlineTextarea}
                placeholder="Write admin reply"
              />

              <div style={styles.inlineMetaRow}>
                <span style={styles.charCount}>{replyText.length}/500</span>
                {replyError ? <span style={styles.fieldErrorText}>{replyError}</span> : null}
              </div>

              <div style={styles.inlineActions}>
                <button
                  type="button"
                  style={styles.primaryButton}
                  disabled={savingReply}
                  onClick={() => handleSaveReply(comment.id)}
                >
                  {savingReply ? "Replying..." : "Post Reply"}
                </button>
                <button type="button" style={styles.secondaryButton} onClick={cancelReply}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {replies.length ? (
            <div style={styles.replyThread}>{replies.map((reply) => renderComment(reply, depth + 1))}</div>
          ) : null}
        </div>
      </div>
    );
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${colors.bgLight} 0%, #ffffff 100%)`,
      padding: "40px 22px 60px",
    },
    container: {
      maxWidth: "1040px",
      margin: "0 auto",
    },
    topBar: {
      marginBottom: "20px",
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
    backLink: {
      textDecoration: "none",
      color: colors.primaryDark,
      fontSize: "14px",
      fontWeight: "800",
    },
    heroCard: {
      background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryGradientEnd} 100%)`,
      borderRadius: "26px",
      padding: "28px",
      color: colors.white,
      boxShadow: "0 20px 50px rgba(26, 31, 90, 0.18)",
      marginBottom: "22px",
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
    heroMetaRow: {
      marginTop: "14px",
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    heroMetaPill: {
      backgroundColor: "rgba(255,255,255,0.16)",
      border: "1px solid rgba(255,255,255,0.22)",
      color: colors.white,
      borderRadius: "999px",
      padding: "4px 10px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "0.3px",
      textTransform: "uppercase",
    },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "12px",
      marginBottom: "20px",
    },
    statCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "16px",
      padding: "14px",
      boxShadow: "0 10px 20px rgba(26, 31, 90, 0.04)",
    },
    statLabel: {
      fontSize: "11px",
      fontWeight: "700",
      color: colors.textMedium,
      textTransform: "uppercase",
      letterSpacing: "0.6px",
      marginBottom: "5px",
    },
    statValue: {
      fontSize: "20px",
      fontWeight: "800",
      color: colors.textDark,
    },
    card: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "24px",
      padding: "24px",
      boxShadow: "0 14px 28px rgba(26, 31, 90, 0.05)",
      marginBottom: "20px",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "800",
      color: colors.textDark,
      marginBottom: "14px",
    },
    composerIdentity: {
      marginBottom: "10px",
      padding: "8px 10px",
      borderRadius: "10px",
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: colors.bgStats,
      color: colors.textDark,
      fontSize: "13px",
    },
    textarea: {
      width: "100%",
      minHeight: "124px",
      borderRadius: "16px",
      border: `1px solid ${newCommentError ? colors.danger : colors.borderLight}`,
      backgroundColor: colors.white,
      padding: "14px 16px",
      fontSize: "14px",
      color: colors.textDark,
      outline: "none",
      resize: "vertical",
      boxSizing: "border-box",
      lineHeight: "1.7",
    },
    helperRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginTop: "8px",
      flexWrap: "wrap",
    },
    helperText: {
      fontSize: "13px",
      color: colors.textMedium,
      lineHeight: "1.7",
    },
    fieldErrorText: {
      fontSize: "13px",
      color: colors.danger,
      fontWeight: "600",
    },
    charCount: {
      fontSize: "12px",
      color: colors.textMedium,
      fontWeight: "600",
    },
    primaryButton: {
      backgroundColor: colors.accentOrange,
      color: colors.white,
      border: "none",
      borderRadius: "12px",
      padding: "10px 16px",
      fontSize: "13px",
      fontWeight: "800",
      cursor: "pointer",
    },
    secondaryButton: {
      backgroundColor: colors.white,
      color: colors.primaryDark,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "12px",
      padding: "10px 16px",
      fontSize: "13px",
      fontWeight: "800",
      cursor: "pointer",
      textDecoration: "none",
    },
    ghostButton: {
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: colors.white,
      color: colors.primaryDark,
      borderRadius: "10px",
      padding: "8px 12px",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
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
    successBox: {
      backgroundColor: "#ECFDF3",
      border: "1px solid #BBF7D0",
      borderRadius: "16px",
      padding: "16px",
      color: colors.success,
      marginBottom: "16px",
      fontWeight: "700",
    },
    emptyBox: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "20px",
      padding: "34px 24px",
      textAlign: "center",
      boxShadow: "0 12px 26px rgba(26, 31, 90, 0.05)",
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
      lineHeight: "1.8",
      margin: 0,
    },
    commentsList: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },
    commentCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "18px",
      padding: "16px",
      boxShadow: "0 10px 24px rgba(26, 31, 90, 0.05)",
      display: "grid",
      gridTemplateColumns: "44px 1fr",
      gap: "12px",
    },
    commentAvatar: {
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      backgroundColor: "#EEF2FF",
      color: colors.primaryDark,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "800",
      fontSize: "13px",
    },
    commentBody: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    commentTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px",
      flexWrap: "wrap",
    },
    commentMeta: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    commentUser: {
      fontSize: "14px",
      fontWeight: "800",
      color: colors.primaryDark,
    },
    commentTagRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap",
    },
    rolePill: {
      color: colors.white,
      borderRadius: "999px",
      padding: "3px 10px",
      fontSize: "10px",
      fontWeight: "800",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    },
    editedPill: {
      backgroundColor: colors.bgStats,
      color: colors.primaryDark,
      borderRadius: "999px",
      padding: "3px 10px",
      fontSize: "10px",
      fontWeight: "700",
    },
    adminReplyPill: {
      backgroundColor: "#DBEAFE",
      color: colors.info,
      borderRadius: "999px",
      padding: "3px 10px",
      fontSize: "10px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.4px",
    },
    commentTime: {
      fontSize: "12px",
      color: colors.textMedium,
      fontWeight: "600",
    },
    commentText: {
      margin: 0,
      fontSize: "14px",
      color: colors.textDark,
      lineHeight: "1.75",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    },
    commentActions: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap",
    },
    editorWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    replyBox: {
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: "#F9FBFF",
      borderRadius: "14px",
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    inlineTextarea: {
      width: "100%",
      minHeight: "90px",
      borderRadius: "12px",
      border: `1px solid ${colors.borderLight}`,
      backgroundColor: colors.white,
      padding: "12px",
      fontSize: "13px",
      color: colors.textDark,
      outline: "none",
      resize: "vertical",
      boxSizing: "border-box",
      lineHeight: "1.6",
    },
    inlineMetaRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      flexWrap: "wrap",
    },
    inlineActions: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    replyThread: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      marginTop: "4px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <Link to={`/tickets/details/${id}`} style={styles.backLink}>
            &larr; Back to Ticket Details
          </Link>
        </div>

        <div style={styles.heroCard}>
          <div style={styles.eyebrow}>Task: Comments</div>
          <h1 style={styles.title}>{bannerTitle}</h1>
          <p style={styles.subtitle}>
            Ticket #{id}. This conversation belongs only to this ticket and does not mix with other tickets.
          </p>
          <div style={styles.heroMetaRow}>
            <span style={styles.heroMetaPill}>Status: {ticket?.status || "UNKNOWN"}</span>
            <span style={styles.heroMetaPill}>Category: {ticket?.category || "N/A"}</span>
            <span style={styles.heroMetaPill}>Priority: {ticket?.priority || "N/A"}</span>
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

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Items</div>
            <div style={styles.statValue}>{totalComments}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Top-Level Comments</div>
            <div style={styles.statValue}>{topLevelCount}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Replies</div>
            <div style={styles.statValue}>{totalReplies}</div>
          </div>
        </div>

        {pageError ? <div style={styles.errorBox}>{pageError}</div> : null}
        {flash.message ? (
          <div style={flash.type === "success" ? styles.successBox : styles.errorBox}>
            {flash.message}
          </div>
        ) : null}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Add Comment to Ticket #{id}</h2>
          <div style={styles.composerIdentity}>
            Commenting as: <strong>{user?.name || `User #${user?.id || "-"}`}</strong>
          </div>

          <form onSubmit={handleCreateComment}>
            <textarea
              value={newComment}
              onChange={(event) => {
                const value = event.target.value;
                setNewComment(value);
                setNewCommentError(validateComment(value));
              }}
              placeholder="Write your update or message here..."
              style={styles.textarea}
            />

            <div style={styles.helperRow}>
              <div>
                {newCommentError ? (
                  <div style={styles.fieldErrorText}>{newCommentError}</div>
                ) : (
                  <div style={styles.helperText}>
                    Keep your comment focused and relevant to this ticket.
                  </div>
                )}
              </div>
              <div style={styles.charCount}>{newComment.length}/500</div>
            </div>

            <button type="submit" style={styles.primaryButton} disabled={creating}>
              {creating ? "Posting..." : "Post Comment"}
            </button>
          </form>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading comments...</div>
        ) : (commentsByParent.get("ROOT") || []).length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyTitle}>No comments yet</div>
            <p style={styles.emptyText}>
              Start this thread by adding the first comment for this ticket.
            </p>
          </div>
        ) : (
          <div style={styles.commentsList}>
            {(commentsByParent.get("ROOT") || []).map((comment) => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketComments;
