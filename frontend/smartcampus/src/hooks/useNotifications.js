import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL = 30000; // 30 seconds

/**
 * Custom hook for managing notifications.
 * Polls for unread count every 30 seconds while the user is authenticated.
 */
function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail on polling errors
    }
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [all, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(all);
      setUnreadCount(count);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
  }, [isAuthenticated, fetchUnreadCount]);

  // Set up polling interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  return { notifications, unreadCount, loading, refresh };
}

export default useNotifications;
