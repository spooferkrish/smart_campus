import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const getPasswordChecks = (password) => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecial: /[^A-Za-z0-9]/.test(password),
});

function SignupPage() {
  const { signupWithEmail } = useAuth();
  const navigate = useNavigate();
  const TECHNICIAN_SPECIALTIES = [
    'GENERAL',
    'ELECTRICAL',
    'NETWORK',
    'EQUIPMENT',
    'CLEANING',
    'FURNITURE',
    'OTHER',
  ];
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    technicianSpecialty: 'GENERAL',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    if (error) {
      setError('');
    }
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === 'role') {
        return {
          ...prev,
          role: value,
          technicianSpecialty: value === 'TECHNICIAN' ? prev.technicianSpecialty : 'GENERAL',
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const passwordChecks = getPasswordChecks(form.password);
  const hasStrongPassword = Object.values(passwordChecks).every(Boolean);
  const showPasswordRules = form.password.length > 0;
  const showConfirmMessage = form.confirmPassword.length > 0;
  const passwordsMatch = form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!hasStrongPassword) {
      setError('Please choose a stronger password that satisfies all listed requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please re-check and try again.');
      return;
    }

    setSubmitting(true);

    try {
      const { confirmPassword: _confirmPassword, ...rest } = form;
      const payload = {
        ...rest,
        technicianSpecialty:
          form.role === 'TECHNICIAN' ? form.technicianSpecialty : undefined,
        category:
          form.role === 'TECHNICIAN' ? form.technicianSpecialty : undefined,
      };
      await signupWithEmail(payload);
      navigate('/login', {
        replace: true,
        state: { message: 'Account created successfully. Please sign in.' },
      });
    } catch (err) {
      const fallback = 'Unable to create account. Please try again.';
      setError(err.response?.data?.message || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-badge">SmartCampus Signup</div>
        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-subtitle">Get started with booking, tickets, and notifications.</p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="auth-input"
            placeholder="Jane Doe"
            required
          />

          <label className="auth-label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="auth-input"
            placeholder="you@campus.edu"
            required
          />

          <label className="auth-label" htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="auth-input"
            required
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
          </select>

          {form.role === 'TECHNICIAN' && (
            <>
              <label className="auth-label" htmlFor="technicianSpecialty">Technician category</label>
              <select
                id="technicianSpecialty"
                name="technicianSpecialty"
                value={form.technicianSpecialty}
                onChange={handleChange}
                className="auth-input"
                required
              >
                {TECHNICIAN_SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </>
          )}

          <label className="auth-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="auth-input"
            placeholder="Minimum 8 characters"
            required
            minLength={8}
          />

          {showPasswordRules && (
            <div className="password-rules" aria-live="polite">
              <p className="password-rules-title">Use a strong password with:</p>
              <ul className="password-rules-list">
                <li className={`password-rule ${passwordChecks.minLength ? 'is-valid' : 'is-pending'}`}>
                  At least 8 characters
                </li>
                <li className={`password-rule ${passwordChecks.hasUppercase ? 'is-valid' : 'is-pending'}`}>
                  One uppercase letter (A-Z)
                </li>
                <li className={`password-rule ${passwordChecks.hasLowercase ? 'is-valid' : 'is-pending'}`}>
                  One lowercase letter (a-z)
                </li>
                <li className={`password-rule ${passwordChecks.hasNumber ? 'is-valid' : 'is-pending'}`}>
                  One number (0-9)
                </li>
                <li className={`password-rule ${passwordChecks.hasSpecial ? 'is-valid' : 'is-pending'}`}>
                  One special character (e.g. !@#$%)
                </li>
              </ul>
            </div>
          )}

          <label className="auth-label" htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="auth-input"
            placeholder="Re-enter your password"
            required
          />

          {showConfirmMessage && (
            <p className={`confirm-password-message ${passwordsMatch ? 'is-valid' : 'is-invalid'}`}>
              {passwordsMatch ? 'Passwords match.' : 'Passwords do not match yet.'}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
        <p className="auth-helper">If you register as TECHNICIAN, choose your support category (electrical, furniture, network, etc.).</p>
      </div>
    </div>
  );
}

export default SignupPage;
