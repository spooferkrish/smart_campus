import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../../services/api";
import "./QRCheckInPage.css";

function QRCheckInPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    // First try to get data from URL parameters (from QR code)
    const searchParams = new URLSearchParams(location.search);
    const qrData = searchParams.get("data");
    
    if (qrData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(qrData));
        setBooking(decodedData);
        setLoading(false);
        return;
      } catch (err) {
        console.error("Failed to parse QR data:", err);
      }
    }

    // Fallback: try to fetch from API
    fetchBooking();
  }, [id, location.search]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/bookings/${id}`);
      setBooking(response.data);
      setApiAvailable(true);
    } catch (err) {
      console.error("API fetch error:", err);
      setApiAvailable(false);
      setError("Note: Backend is offline. Showing data from QR code. Check-in will update when online.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setChecking(true);
      setError("");
      
      await API.put(`/bookings/checkin/${id}`);
      setSuccess("✓ Check-in successful!");

      const token = localStorage.getItem("token");
      if (token) {
        setTimeout(() => {
          navigate("/bookings");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed. Make sure you have internet connection.");
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="qr-checkin-page">
        <div className="qr-checkin-container">
          <div className="loading-state">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="qr-checkin-page">
        <div className="qr-checkin-container">
          <div className="error-state">Booking data not found. Invalid QR code.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-checkin-page">
      <div className="qr-checkin-container">
        <div className="qr-checkin-header">
          <h1>Booking Details</h1>
          <p className="qr-checkin-subtitle">Verify and check in {!apiAvailable && "(Offline Mode)"}</p>
        </div>

        <div className="qr-checkin-card">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="booking-details-grid">
            <div className="detail-item">
              <span className="detail-label">Booking ID</span>
              <span className="detail-value">{booking.id}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Resource</span>
              <span className="detail-value">{booking.resourceName}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Purpose</span>
              <span className="detail-value">{booking.purpose}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Booked By</span>
              <span className="detail-value">{booking.bookedBy}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Attendees</span>
              <span className="detail-value">{booking.attendees}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Start Time</span>
              <span className="detail-value">{booking.startTime}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">End Time</span>
              <span className="detail-value">{booking.endTime}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className={`detail-value status-${booking.status?.toLowerCase() || 'unknown'}`}>
                {booking.status}
              </span>
            </div>
          </div>

          <div className="qr-checkin-actions">
            {booking.status === "APPROVED" ? (
              <button
                className="btn btn-check-in"
                onClick={handleCheckIn}
                disabled={checking || success}
              >
                {checking ? "Checking in..." : "✓ Verify Check-in"}
              </button>
            ) : (
              <div className="btn-disabled-reason">
                This booking is {booking.status}. Only APPROVED bookings can be checked in.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRCheckInPage;
