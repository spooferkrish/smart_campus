import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import RoleChangeModal from './RoleChangeModal';

const ROLE_COLORS = {
  USER: '#0d6efd',
  ADMIN: '#dc3545',
  TECHNICIAN: '#fd7e14',
};

/**
 * Admin-only page for managing users and their roles.
 */
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalUser, setModalUser] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    userService.getAllUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User deleted successfully.');
    } catch {
      showToast('Failed to delete user.');
    }
  };

  const handleRoleSuccess = (updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast(`Role updated to ${updated.role} for ${updated.name}.`);
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>User Management</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {/* Toast */}
        {toast && <div style={styles.toast}>{toast}</div>}

        {/* Table */}
        {loading ? (
          <p style={styles.empty}>Loading users...</p>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>No users found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>{u.name?.[0]?.toUpperCase()}</div>
                        {u.name}
                      </div>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: ROLE_COLORS[u.role] }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.rowActions}>
                        <button
                          onClick={() => setModalUser(u)}
                          style={styles.editBtn}
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalUser && (
        <RoleChangeModal
          targetUser={modalUser}
          onClose={() => setModalUser(null)}
          onSuccess={handleRoleSuccess}
        />
      )}
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
    maxWidth: '1000px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#212529',
    marginBottom: '20px',
  },
  search: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #ced4da',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    boxSizing: 'border-box',
  },
  toast: {
    background: '#d1e7dd',
    color: '#0f5132',
    padding: '10px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '10px',
    boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
  },
  thead: {
    background: '#f1f3f5',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f1f3f5',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#495057',
    verticalAlign: 'middle',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#0d6efd',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '13px',
    flexShrink: 0,
  },
  badge: {
    display: 'inline-block',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  rowActions: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    padding: '5px 12px',
    border: '1px solid #0d6efd',
    borderRadius: '5px',
    background: '#fff',
    color: '#0d6efd',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  deleteBtn: {
    padding: '5px 12px',
    border: '1px solid #dc3545',
    borderRadius: '5px',
    background: '#fff',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    padding: '48px',
    color: '#adb5bd',
    fontSize: '15px',
  },
};

export default UserManagement;
