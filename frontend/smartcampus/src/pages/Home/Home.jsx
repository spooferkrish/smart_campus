import "./Home.css";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer/Footer";

function Home() {
  const features = [
    {
      id: 1,
      icon: "📍",
      title: "Centralized Resource Library",
      desc: "Access all campus facilities, equipment, and spaces in one unified platform"
    },
    {
      id: 2,
      icon: "⚡",
      title: "Instant Booking System",
      desc: "Reserve facilities and resources with automatic conflict detection"
    },
    {
      id: 3,
      icon: "🎯",
      title: "Issue Resolution",
      desc: "Report and track maintenance issues with intelligent technician assignment"
    }
  ];

  const services = [
    {
      id: 1,
      icon: "📚",
      title: "Resource Catalog",
      desc: "Complete inventory of classrooms, labs, and facilities with real-time availability"
    },
    {
      id: 2,
      icon: "📅",
      title: "Smart Scheduling",
      desc: "AI-powered booking system that prevents double-bookings and optimizes facility usage"
    },
    {
      id: 3,
      icon: "🔧",
      title: "Maintenance Management",
      desc: "Streamlined ticketing system for facility issues with priority-based routing"
    },
    {
      id: 4,
      icon: "📊",
      title: "Usage Analytics",
      desc: "Comprehensive dashboards showing facility utilization and booking patterns"
    },
    {
      id: 5,
      icon: "✅",
      title: "Approval Workflows",
      desc: "Automated request approval process with admin oversight and control"
    },
    {
      id: 6,
      icon: "🔐",
      title: "Role-Based Security",
      desc: "Granular access controls ensuring data security and compliance"
    }
  ];

  const quickActions = [
    { to: "/resources", title: "Browse resources", desc: "Explore available facilities." },
    { to: "/create", title: "Create a booking", desc: "Request a new resource slot." },
    { to: "/tickets/create", title: "Report an issue", desc: "Open a maintenance ticket." },
    { to: "/admin", title: "Admin dashboard", desc: "Review requests and approvals." },
  ];

  const benefits = [
    {
      id: 1,
      icon: "📚",
      title: "Real-Time Visibility",
      desc: "Access complete facility information and resource availability instantly across campus."
    },
    {
      id: 2,
      icon: "✅",
      title: "Conflict-Free Booking",
      desc: "Intelligent validation engine eliminates scheduling conflicts automatically."
    },
    {
      id: 3,
      icon: "🚀",
      title: "Fast Incident Response",
      desc: "Route issues to technicians intelligently with priority-based assignment."
    },
    {
      id: 4,
      icon: "🔐",
      title: "Role-Based Control",
      desc: "Admin-grade access management with real-time approval workflows."
    }
  ];

  const platformHighlights = [
    {
      id: 1,
      category: "Resources",
      title: "Facilities Catalog",
      desc: "Complete inventory of campus facilities with live availability"
    },
    {
      id: 2,
      category: "Booking",
      title: "Smart Scheduling",
      desc: "Zero-conflict booking engine with instant approvals"
    },
    {
      id: 3,
      category: "Tickets",
      title: "Incident Management",
      desc: "Unified ticketing with intelligent technician routing"
    },
    {
      id: 4,
      category: "Admin",
      title: "Operations Hub",
      desc: "Centralized control dashboard for all approvals and settings"
    }
  ];

  return (
    <div className="home-shell">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-left">
            <p className="hero-kicker">Smart Campus Platform</p>
            <h1 className="hero-heading">
              Streamline campus<br />operations with<br />intelligent resource management
            </h1>
            <Link to="/create" className="btn btn-primary hero-btn">
              Start Booking
            </Link>
          </div>
          <div className="phone-badge">
            <span>📞</span>
            <span className="phone-number">+94 11 754 4801</span>
          </div>
        </div>
      </section>

      {/* Horizontal Features Section */}
      <section className="features-horizontal sc-container">
        <div className="features-grid-horizontal">
          {features.map((feature) => (
            <div key={feature.id} className="feature-h-card">
              <div className="feature-h-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Image + Content Section */}
      <section className="story-section sc-container">
        <div className="story-container">
          <div className="story-image-placeholder">
            <div className="placeholder-content">
             <img src="/malabe-library4.png" alt="Smart Campus" />
            </div>
          </div>
          <div className="story-content">
            <p className="story-kicker">Why Smart Campus</p>
            <h2 className="story-title">Optimize Your Campus Operations</h2>
            <p className="story-desc">
              Smart Campus revolutionizes how educational institutions manage resources. Our integrated platform combines resource discovery, intelligent booking systems, and rapid issue resolution into one seamless solution. Reduce scheduling conflicts, improve facility utilization, and enhance the student and staff experience.
            </p>
            <Link to="/resources" className="btn btn-primary">
              Explore Resources
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="services-section sc-container">
        <h2 className="services-title">Comprehensive Campus Management Features</h2>
        <p className="services-subtitle">All the tools you need to manage campus resources, bookings, and operations efficiently</p>
        
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="quick-actions sc-container">
        <header className="section-head">
          <div className="section-head-badge">Key Features</div>
          <h2>Quick Access</h2>
          <p>Get started with the most common tasks in seconds</p>
        </header>

        <div className="action-grid">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} className="action-card">
              <div>
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
              </div>
              <span>Open</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
