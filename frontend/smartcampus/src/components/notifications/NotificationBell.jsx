import { useState, useRef, useEffect } from 'react';
import useNotifications from '../../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { unreadCount, refresh } = useNotifications();
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open) refresh();
    setOpen((prev) => !prev);
  };

  return (
    <div ref={ref} style={styles.wrapper}>
      <button onClick={handleToggle} style={styles.bell} title="Notifications">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  bell: {
    position: 'relative',
    background: 'rgba(15, 118, 110, 0.08)',
    border: '1px solid rgba(15, 118, 110, 0.18)',
    color: 'var(--sc-primary)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: '0',
    right: '0',
    background: '#dc3545',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '10px',
    padding: '1px 5px',
    minWidth: '16px',
    textAlign: 'center',
    lineHeight: '14px',
  },
};

export default NotificationBell;
