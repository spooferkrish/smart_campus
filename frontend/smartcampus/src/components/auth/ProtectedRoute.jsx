import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

/**
 * Wrapper for routes that require authentication.
 * Optionally enforces a required role (e.g. "ADMIN").
 */
function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  const { isAuthenticated, loading, user, getRoleDashboardPath } = useAuth();
  const roleList = allowedRoles?.length ? allowedRoles : requiredRole ? [requiredRole] : null;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roleList && !roleList.includes(user?.role)) {
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
  }

  return children;
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0f3460',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  forbidden: {
    textAlign: 'center',
    padding: '64px 24px',
    color: '#6c757d',
  },
};

export default ProtectedRoute;
