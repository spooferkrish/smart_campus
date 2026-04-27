import { useAuth } from '../../context/AuthContext';
import RoleDashboardLayout from './RoleDashboardLayout';

function TechnicianDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Account Role', value: 'Technician' },
    { label: 'Status', value: 'On Duty' },
    {
      label: 'Notifications',
      value: user?.notificationsEnabled ? 'On' : 'Off',
    },
  ];

  const actions = [
    {
      to: '/tickets/technician',
      title: 'Assigned Tickets',
      desc: 'Review all maintenance tickets assigned to you.',
    },
    {
      to: '/notifications',
      title: 'Notifications',
      desc: 'Check assignment updates and ticket alerts.',
    },
    {
      to: '/account/settings',
      title: 'Profile Settings',
      desc: 'Maintain your profile and notification preferences.',
    },
  ];

  return (
    <RoleDashboardLayout
      badge="Technician Dashboard"
      heading={`Welcome, ${user?.name || 'Technician'}`}
      description="Monitor assigned maintenance work, update ticket progress, and stay notified about operational changes."
      stats={stats}
      actions={actions}
    />
  );
}

export default TechnicianDashboard;
