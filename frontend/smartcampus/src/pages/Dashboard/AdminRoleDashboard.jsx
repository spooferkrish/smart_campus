import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardPages.css';

function AdminRoleDashboard() {
  const { user } = useAuth();

  const actions = [
    {
      to: '/admin/users',
      title: 'User Management',
      desc: 'Manage user roles and account administration.',
    },
    {
      to: '/admin/bookings',
      title: 'Booking Administration',
      desc: 'Review and approve or reject booking requests.',
    },
    {
      to: '/tickets/admin',
      title: 'Ticket Administration',
      desc: 'Monitor support tickets and assign technicians.',
    },
    {
      to: '/notifications',
      title: 'Notifications',
      desc: 'Track system-wide updates and role changes.',
    },
    {
      to: '/account/settings',
      title: 'Admin Settings',
      desc: 'Update profile and notification preferences.',
    },
  ];

  return (
    <section className="role-dashboard sc-container">
      <header className="role-hero">
        <span className="role-badge">Admin Dashboard</span>
        <h1>Welcome, {user?.name || 'Administrator'}</h1>
        <p>
          Oversee operations across bookings, ticketing, and user access while
          keeping platform workflows stable.
        </p>
      </header>

      <div className="dashboard-stats">
        <article className="dashboard-stat-card">
          <p>Account Role</p>
          <h3>Admin</h3>
        </article>
        <article className="dashboard-stat-card">
          <p>System Access</p>
          <h3>Full</h3>
        </article>
        <article className="dashboard-stat-card">
          <p>Notifications</p>
          <h3>{user?.notificationsEnabled ? 'On' : 'Off'}</h3>
        </article>
      </div>

      <div className="dashboard-grid">
        {actions.map((item) => (
          <Link to={item.to} key={item.to} className="dashboard-action">
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <span>Open</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default AdminRoleDashboard;
