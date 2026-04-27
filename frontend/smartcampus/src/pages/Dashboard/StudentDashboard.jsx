import { useAuth } from '../../context/AuthContext';
import RoleDashboardLayout from './RoleDashboardLayout';

function StudentDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Account Role', value: 'Student' },
    { label: 'Status', value: 'Active' },
    {
      label: 'Notifications',
      value: user?.notificationsEnabled ? 'On' : 'Off',
    },
  ];

  const actions = [
    {
      to: '/bookings',
      title: 'My Bookings',
      desc: 'View your current and past booking requests.',
    },
    {
      to: '/create',
      title: 'Create Booking',
      desc: 'Reserve campus facilities with approval workflow.',
    },
    {
      to: '/tickets/my',
      title: 'My Tickets',
      desc: 'Track maintenance and support requests.',
    },
    {
      to: '/notifications',
      title: 'Notifications',
      desc: 'See booking and ticket updates in one feed.',
    },
    {
      to: '/account/settings',
      title: 'Profile Settings',
      desc: 'Edit your profile and notification preferences.',
    },
  ];

  return (
    <RoleDashboardLayout
      badge="Student Dashboard"
      heading={`Welcome, ${user?.name || 'Student'}`}
      description="Manage your campus activity from one place, including reservations, support tickets, and account preferences."
      stats={stats}
      actions={actions}
    />
  );
}

export default StudentDashboard;
