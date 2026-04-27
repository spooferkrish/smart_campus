import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './AuthPages.css';

/**
 * Handles the redirect from Google OAuth2 after successful login.
 * Extracts the token from the URL, saves it, and fetches user info.
 */
function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const { setAuthToken, setUser, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login');
      return;
    }

    setAuthToken(token);

    authService.getCurrentUser()
      .then((user) => {
        setUser(user);
        navigate(getRoleDashboardPath(user?.role), { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [searchParams, setAuthToken, setUser, getRoleDashboardPath, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <p style={styles.text}>Signing you in...</p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0f3460',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    color: '#6c757d',
    fontSize: '16px',
  },
};

export default OAuth2RedirectHandler;
