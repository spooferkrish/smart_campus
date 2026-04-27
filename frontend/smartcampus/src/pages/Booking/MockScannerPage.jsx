import { useEffect, useMemo, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

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

const parseBookingId = (value) => {
  if (!value) return "";
  const matches = String(value).match(/\d+/g);
  if (!matches || matches.length === 0) return "";
  return matches[matches.length - 1];
};

const parseQrJson = (value) => {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
};

const buildMockBooking = (id, rawValue) => {
  if (MOCK_BOOKINGS[id]) {
    return MOCK_BOOKINGS[id];
  }

  return {
    id: Number(id) || 0,
    resourceName: "Unknown Resource",
    purpose: "Mock booking from QR",
    attendees: 0,
    startTime: "N/A",
    endTime: "N/A",
    status: "PENDING",
    rawValue
  };
};

function MockScannerPage() {
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
    errorBox: {
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      color: colors.danger,
      padding: "12px 14px",
      borderRadius: "14px",
      fontSize: "13px",
      fontWeight: "600",
      marginTop: "16px",
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
  };
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("mock-reader", {
      fps: 10,
      qrbox: 250
    });

    scanner.render(
      (decodedText) => {
        const parsed = parseQrJson(decodedText);

        if (parsed) {
          setError("");
          setBooking(parsed);
          return;
        }

        const id = parseBookingId(decodedText);
        if (!id) {
          setError("Could not read booking details from the QR code.");
          setBooking(null);
          return;
        }

        setError("");
        setBooking(buildMockBooking(id, decodedText));
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const bookingEntries = useMemo(() => {
    if (!booking) return [];

    const formatValue = (value) => {
      if (value === null || value === undefined || value === "") {
        return "N/A";
      }
      return String(value);
    };

    return [
      ["ID", booking.id],
      ["Resource", booking.resourceName],
      ["Purpose", booking.purpose],
      ["Attendees", booking.attendees],
      ["Start", booking.startTime],
      ["End", booking.endTime],
      ["Status", booking.status],
      ["Checked In", booking.checkedInTime],
      ["Rejection Reason", booking.rejectionReason]
    ].map(([label, value]) => [label, formatValue(value)]);
  }, [booking]);

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Mock QR Scanner</h1>
          <p style={styles.heroText}>
            Scan a QR payload to preview booking details. This page uses mock
            data for testing the verification flow.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Scanner</h2>
          <p style={styles.sectionText}>
            Point the camera at a QR code to load booking details.
          </p>

          <div id="mock-reader" style={{ maxWidth: 360 }} />

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          {booking ? (
            <div className="mt-4">
              <h3 className="h6">Booking Details</h3>
              <div className="table-responsive border rounded-3 bg-light">
                <table className="table table-sm mb-0">
                  <tbody>
                    {bookingEntries.map(([label, value]) => (
                      <tr key={label}>
                        <th scope="row" style={{ width: 140 }}>
                          {label}
                        </th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={styles.noteBox}>
              <h3 style={styles.noteTitle}>Ready to Scan</h3>
              <p style={styles.noteText}>
                Use a mock QR code to simulate a booking verification. Once
                scanned, the booking summary will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MockScannerPage;
