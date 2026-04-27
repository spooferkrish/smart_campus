import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    try {
      const response = await requestPasswordReset(email);
      setResult(response);
    } catch (err) {
      const fallback = 'Failed to process password reset request.';
      setError(err.response?.data?.message || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-badge">Account Recovery</div>
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to generate a reset token.</p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        {result && (
          <div className="auth-alert auth-alert-success">
            <div>{result.message}</div>
            {result.resetToken && (
              <div className="auth-helper">
                Reset token: <strong>{result.resetToken}</strong>
                <br />
                Use it in the reset form below.
              </div>
            )}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@campus.edu"
            required
          />
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Generate Reset Token'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/reset-password">Have a token? Reset now</Link>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
