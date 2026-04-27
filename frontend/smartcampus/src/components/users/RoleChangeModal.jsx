import { useState } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['USER', 'TECHNICIAN', 'ADMIN'];

const ROLE_COLORS = {
  USER: '#0d6efd',
  ADMIN: '#dc3545',
  TECHNICIAN: '#fd7e14',
};

/**
 * Modal for changing a user's role.
 * Prevents admins from changing their own role.
 */
function RoleChangeModal({ targetUser, onClose, onSuccess }) {
  const { user: currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState(targetUser.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSelf = currentUser?.id === targetUser.id;

  const handleConfirm = async () => {
    if (isSelf) {
      setError('You cannot change your own role.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const updated = await userService.updateUserRole(targetUser.id, selectedRole);
      onSuccess(updated);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>Change User Role</h3>

        <div style={styles.userInfo}>
          <strong>{targetUser.name}</strong>
          <span style={styles.email}>{targetUser.email}</span>
          <span>
            Current role:{' '}
            <span style={{ ...styles.badge, background: ROLE_COLORS[targetUser.role] }}>
              {targetUser.role}
            </span>
          </span>
        </div>

        {isSelf && (
          <div style={styles.warning}>You cannot change your own role.</div>
        )}

        <label style={styles.label}>Select new role</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={isSelf || loading}
          style={styles.select}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.buttons}>
          <button onClick={onClose} style={styles.cancelBtn} disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={styles.confirmBtn}
            disabled={loading || isSelf || selectedRole === targetUser.role}
          >
            {loading ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    padding: '32px',
    width: '400px',
    maxWidth: '90vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    margin: '0 0 20px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#212529',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#495057',
  },
  email: {
    color: '#6c757d',
    fontSize: '13px',
  },
  badge: {
    display: 'inline-block',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  warning: {
    background: '#fff3cd',
    color: '#856404',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#495057',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '14px',
    marginBottom: '16px',
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    padding: '8px 20px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  confirmBtn: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '6px',
    background: '#0d6efd',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default RoleChangeModal;
