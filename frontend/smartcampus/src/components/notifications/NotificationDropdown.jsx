import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';

const TYPE_ICONS = {
  BOOKING_APPROVED: { icon: '✅', color: '#28a745' },
  BOOKING_REJECTED: { icon: '❌', color: '#dc3545' },
  TICKET_STATUS_CHANGED: { icon: '🔧', color: '#fd7e14' },
  TICKET_ASSIGNED: { icon: '📋', color: '#0d6efd' },
  NEW_COMMENT: { icon: '💬', color: '#6f42c1' },
  ROLE_CHANGED: { icon: '👤', color: '#20c997' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    notificationService.getNotifications()
      .then((data) => setNotifications(data.slice(0, 10)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = async () => {
    await notificationService.clearAll();
    setNotifications([]);
  };

  const handleClick = async (n) => {
    if (!n.isRead) await handleMarkAsRead(n.id);
    if (n.referenceType === 'BOOKING') navigate('/bookings');
    else if (n.referenceType === 'TICKET') navigate('/tickets');
    onClose();
  };

  return (
    <div style={styles.dropdown}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>Notifications</span>
        <button onClick={handleMarkAllRead} style={styles.linkBtn}>Mark all read</button>
      </div>

      {/* List */}
      <div style={styles.list}>
        {loading && <p style={styles.empty}>Loading...</p>}
        {!loading && notifications.length === 0 && (
          <p style={styles.empty}>No notifications</p>
        )}
        {notifications.map((n) => {
          const meta = TYPE_ICONS[n.type] || { icon: '🔔', color: '#6c757d' };
          return (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                ...styles.item,
                background: n.isRead ? '#fff' : '#f0f4ff',
              }}
            >
              <span style={{ ...styles.icon, color: meta.color }}>{meta.icon}</span>
              <div style={styles.content}>
                <div style={{ ...styles.itemTitle, fontWeight: n.isRead ? '400' : '600' }}>
                  {n.title}
                </div>
                <div style={styles.itemMsg}>{n.message}</div>
                <div style={styles.itemTime}>{timeAgo(n.createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button onClick={() => { navigate('/notifications'); onClose(); }} style={styles.linkBtn}>
          View all notifications
        </button>
        <button onClick={handleClearAll} style={{ ...styles.linkBtn, color: '#dc3545' }}>
          Clear all
        </button>
      </div>
    </div>
  );
}

const styles = {
  dropdown: {
    position: 'absolute',
    top: '40px',
    right: '0',
    width: '360px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    zIndex: 1000,
    overflow: 'hidden',
    border: '1px solid #e9ecef',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #e9ecef',
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#212529',
  },
  list: {
    maxHeight: '360px',
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #f8f9fa',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  icon: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '2px',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '13px',
    color: '#212529',
    marginBottom: '2px',
  },
  itemMsg: {
    fontSize: '12px',
    color: '#6c757d',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  itemTime: {
    fontSize: '11px',
    color: '#adb5bd',
    marginTop: '4px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderTop: '1px solid #e9ecef',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#0d6efd',
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0,
  },
  empty: {
    textAlign: 'center',
    padding: '24px',
    color: '#adb5bd',
    fontSize: '13px',
  },
};

export default NotificationDropdown;
