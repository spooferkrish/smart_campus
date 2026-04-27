import { Link } from 'react-router-dom';
import './RoleDashboardLayout.css';

function RoleDashboardLayout({
  badge,
  heading,
  description,
  stats = [],
  actions = [],
}) {
  return (
    <section className="shared-role-dashboard sc-container">
      <header className="shared-role-hero">
        <div className="shared-role-hero-copy">
          <span className="shared-role-badge">{badge}</span>
          <h1>{heading}</h1>
          <p>{description}</p>
        </div>
        <span className="shared-role-chip">Dashboard Overview</span>
      </header>

      <div className="shared-role-panels">
        <section className="shared-role-panel shared-role-panel--stats">
          <h2>Quick Stats</h2>
          <div className="shared-role-stats-grid">
            {stats.map((stat) => (
              <article className="shared-role-stat-item" key={stat.label}>
                <p>{stat.label}</p>
                <h3>{stat.value}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="shared-role-panel shared-role-panel--actions">
          <h2>Quick Actions</h2>
          <div className="shared-role-actions-grid">
            {actions.map((item) => (
              <Link to={item.to} key={item.to} className="shared-role-action-card">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                <span>{item.cta || 'Open'}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default RoleDashboardLayout;