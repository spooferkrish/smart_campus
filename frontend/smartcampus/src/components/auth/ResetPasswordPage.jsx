import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const initialToken = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [form, setForm] = useState({ token: initialToken, newPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await resetPassword(form);
      setSuccess(response.message || 'Password reset successful.');
    } catch (err) {
      const fallback = 'Unable to reset password. Check your token and try again.';
      setError(err.response?.data?.message || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-badge">Account Recovery</div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Enter the token and choose a new password.</p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {success && <div className="auth-alert auth-alert-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="token">Reset token</label>
          <input
            id="token"
            name="token"
            type="text"
            value={form.token}
            onChange={handleChange}
            className="auth-input"
            placeholder="Paste your token"
            required
          />

          <label className="auth-label" htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            className="auth-input"
            placeholder="Minimum 8 characters"
            minLength={8}
            required
          />

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Need a token?</Link>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
