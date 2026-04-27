import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-section footer-brand">
          <h3>SmartCampus</h3>
          <p>Streamline campus operations with intelligent resource management</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <span>f</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <span>𝕏</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <span>in</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/resources">Browse Resources</Link>
            </li>
            <li>
              <Link to="/create">Create Booking</Link>
            </li>
            <li>
              <Link to="/tickets/create">Report Issue</Link>
            </li>
            <li>
              <Link to="/admin">Admin Dashboard</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li>
              <a href="#help">Help Center</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <li>
              <a href="#contact">Contact Us</a>
            </li>
            <li>
              <a href="#feedback">Send Feedback</a>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-section">
          <h4>Get in Touch</h4>
          <ul className="contact-info">
            <li>
              <span className="icon">📍</span>
              <span>SLIIT Malabe Campus</span>
            </li>
            <li>
              <span className="icon">📞</span>
              <a href="tel:+94117544801">+94 11 754 4801</a>
            </li>
            <li>
              <span className="icon">✉️</span>
              <a href="mailto:support@smartcampus.edu">support@smartcampus.edu</a>
            </li>
            <li>
              <span className="icon">⏰</span>
              <span>Mon - Fri: 8AM - 6PM</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom - Legal & Copyright */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div>
            <p>&copy; {currentYear} SmartCampus. All rights reserved.</p>
          </div>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <span className="separator">•</span>
            <a href="#terms">Terms of Service</a>
            <span className="separator">•</span>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
