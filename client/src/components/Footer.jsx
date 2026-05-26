import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="f-col f-main">
          <Link to="/" className="f-brand">
            <span className="f-brand-icon">M</span>
            <span>MANU</span>
          </Link>

          <p className="f-desc">
            Timeless food experiences crafted with care — discover authentic
            recipes and delightful meals delivered to your door.
          </p>

          <div className="f-socials">
            <a
              href="https://facebook.com/profile.php?id=61560783634129"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a
              href="https://www.instagram.com/thedabelistation/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>
        </div>

        <div className="f-col">
          <h4 className="f-heading">Quick Links</h4>
          <nav className="f-links">
            <Link to="/">Home</Link>
            <Link to="/menu">Menu</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/login">Sign In</Link>
          </nav>
        </div>

        <div className="f-col">
          <h4 className="f-heading">Company</h4>
          <nav className="f-links">
            <Link to="/about">About Us</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </nav>
        </div>

        <div className="f-col">
          <h4 className="f-heading">Get in Touch</h4>
          <div className="f-contact">
            <div className="f-contact-item">
              <i className="fa-solid fa-envelope"></i>
              <span>maundabeli2708@gmail.com</span>
            </div>
            <div className="f-contact-item">
              <i className="fa-solid fa-location-dot"></i>
              <span>42W 46th Street, NY 10036</span>
            </div>
            <div className="f-contact-item">
              <i className="fa-solid fa-store"></i>
              <span>Self-pickup only</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MANU. All rights reserved.</p>
      </div>
    </footer>
  );
}
