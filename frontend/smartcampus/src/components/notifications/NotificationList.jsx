import { useState, useEffect } from 'react';
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

/**
 * Full-page notification list with All/Unread filter tabs.
 */
function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = filter === 'unread'
          ? await notificationService.getUnreadNotifications()
          : await notificationService.getNotifications();
        setNotifications(data);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = async (id) => {
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = async () => {
    await notificationService.clearAll();
    setNotifications([]);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>Notifications</h2>
          <div style={styles.actions}>
            <button onClick={handleMarkAllRead} style={styles.actionBtn}>Mark all read</button>
            <button onClick={handleClearAll} style={{ ...styles.actionBtn, color: '#dc3545' }}>
              Clear all
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setFilter('all')}
            style={{ ...styles.tab, ...(filter === 'all' ? styles.tabActive : {}) }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{ ...styles.tab, ...(filter === 'unread' ? styles.tabActive : {}) }}
          >
            Unread
          </button>
        </div>

        {/* Notification Cards */}
        {loading && <p style={styles.empty}>Loading...</p>}
        {!loading && notifications.length === 0 && (
          <p style={styles.empty}>No notifications to show.</p>
        )}
        {notifications.map((n) => {
          const meta = TYPE_ICONS[n.type] || { icon: '🔔', color: '#6c757d' };
          return (
            <div
              key={n.id}
              style={{
                ...styles.card,
                background: n.isRead ? '#fff' : '#f0f4ff',
                borderLeft: `4px solid ${meta.color}`,
              }}
            >
              <div style={styles.cardLeft}>
                <span style={{ ...styles.typeIcon, color: meta.color }}>{meta.icon}</span>
                <div>
                  <div style={{ ...styles.cardTitle, fontWeight: n.isRead ? '400' : '600' }}>
                    {n.title}
                  </div>
                  <div style={styles.cardMsg}>{n.message}</div>
                  <div style={styles.cardTime}>{timeAgo(n.createdAt)}</div>
                </div>
              </div>
              <div style={styles.cardActions}>
                {!n.isRead && (
                  <button onClick={() => handleMarkAsRead(n.id)} style={styles.iconBtn} title="Mark as read">
                    ✓
                  </button>
                )}
                <button onClick={() => handleDelete(n.id)} style={{ ...styles.iconBtn, color: '#dc3545' }} title="Delete">
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8f9fa',
    padding: '32px 16px',
  },
  container: {
    maxWidth: '720px',
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#212529',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#0d6efd',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px',
    borderBottom: '1px solid #dee2e6',
  },
  tab: {
    background: 'none',
    border: 'none',
    padding: '8px 20px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#6c757d',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
  },
  tabActive: {
    color: '#0d6efd',
    borderBottomColor: '#0d6efd',
    fontWeight: '600',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardLeft: {
    display: 'flex',
    gap: '12px',
    flex: 1,
  },
  typeIcon: {
    fontSize: '22px',
    flexShrink: 0,
    marginTop: '2px',
  },
  cardTitle: {
    fontSize: '14px',
    color: '#212529',
    marginBottom: '4px',
  },
  cardMsg: {
    fontSize: '13px',
    color: '#495057',
    lineHeight: '1.5',
  },
  cardTime: {
    fontSize: '11px',
    color: '#adb5bd',
    marginTop: '6px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
    marginLeft: '12px',
  },
  iconBtn: {
    background: 'none',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#28a745',
  },
  empty: {
    textAlign: 'center',
    padding: '48px',
    color: '#adb5bd',
    fontSize: '15px',
  },
};

export default NotificationList;
