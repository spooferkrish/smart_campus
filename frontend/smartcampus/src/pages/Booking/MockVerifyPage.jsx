import { useMemo } from "react";
import { useParams } from "react-router-dom";

const MOCK_BOOKINGS = {
  1: {
    id: 1,
    resourceName: "Lab A",
    purpose: "Programming Class",
    attendees: 40,
    startTime: "2026-04-12 09:00",
    endTime: "2026-04-12 11:00",
    status: "APPROVED"
  },
  2: {
    id: 2,
    resourceName: "Seminar Hall",
    purpose: "Research Meetup",
    attendees: 120,
    startTime: "2026-04-12 14:00",
    endTime: "2026-04-12 16:00",
    status: "PENDING"
  },
  3: {
    id: 3,
    resourceName: "Library Room 3",
    purpose: "Group Study",
    attendees: 8,
    startTime: "2026-04-12 17:00",
    endTime: "2026-04-12 19:00",
    status: "APPROVED"
  }
};

const buildMockBooking = (id) => {
  const numericId = Number(id);
  if (!numericId) return null;
  if (MOCK_BOOKINGS[numericId]) return MOCK_BOOKINGS[numericId];

  return {
    id: numericId,
    resourceName: "Unknown Resource",
    purpose: "Mock booking from QR",
    attendees: 0,
    startTime: "N/A",
    endTime: "N/A",
    status: "PENDING"
  };
};

function MockVerifyPage() {
  const colors = {
    primaryDark: "#1A1F5A",
    primaryGradientEnd: "#2A3080",
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
      maxWidth: "1000px",
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
    card: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "22px",
      padding: "28px",
      boxShadow: "0 16px 36px rgba(17, 24, 39, 0.06)",
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
    detailCard: {
      backgroundColor: colors.bgStats,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: "16px",
      padding: "18px",
      marginTop: "18px",
    },
    detailRow: {
      display: "flex",
      gap: "12px",
      padding: "6px 0",
      borderBottom: `1px solid ${colors.borderLight}`,
      alignItems: "center",
    },
    detailLabel: {
      minWidth: "110px",
      fontWeight: "700",
      color: colors.textDark,
      fontSize: "13px",
    },
    detailValue: {
      color: colors.textDark,
      fontSize: "14px",
    },
    emptyState: {
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      color: colors.danger,
      padding: "12px 14px",
      borderRadius: "14px",
      fontSize: "13px",
      fontWeight: "600",
    },
  };
  const { id } = useParams();

  const booking = useMemo(() => buildMockBooking(id), [id]);

  if (!booking) {
    return (
      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.emptyState}>Booking not found.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Booking Verification</h1>
          <p style={styles.heroText}>
            Mock details shown after scanning the QR code. Verify the booking
            metadata before allowing entry.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Booking Details</h2>
          <p style={styles.sectionText}>
            Review the booking information captured from the QR payload.
          </p>

          <div style={styles.detailCard}>
            {[
              ["ID", booking.id],
              ["Resource", booking.resourceName],
              ["Purpose", booking.purpose],
              ["Attendees", booking.attendees],
              ["Start", booking.startTime],
              ["End", booking.endTime],
              ["Status", booking.status],
            ].map(([label, value], index, arr) => (
              <div
                key={label}
                style={{
                  ...styles.detailRow,
                  borderBottom:
                    index === arr.length - 1 ? "none" : styles.detailRow.borderBottom,
                }}
              >
                <span style={styles.detailLabel}>{label}:</span>
                <span style={styles.detailValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockVerifyPage;
