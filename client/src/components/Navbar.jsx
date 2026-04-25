import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUserStatus();
    fetchCartCount();
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const checkUserStatus = async () => {
    try {
      const response = await fetch("/api/user/status", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/food/cart", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.reduce((sum, item) => sum + item.qty, 0));
      }
    } catch {
      /* ignore */
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/menu?search=${encodeURIComponent(query)}`);
    setQuery("");
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/user/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
        navigate("/menu");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`site-navbar${scrolled ? " navbar-scrolled" : ""}`}>
        <Link to="/" className="brand">
          <span className="brand-icon">M</span>
          <span className="brand-text">MANU</span>
        </Link>

        <div className="nav-center">
          <ul className="nav-menu">
            <li>
              <Link to="/" className={isActive("/") ? "active" : ""}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" className={isActive("/menu") ? "active" : ""}>
                Menu
              </Link>
            </li>
            <li>
              <Link to="/cart" className={`cart-link${isActive("/cart") ? " active" : ""}`}>
                <i className="fa-solid fa-bag-shopping"></i>
                Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-right">
          <form className="nav-search" onSubmit={handleSearch}>
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Search dishes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          {!loading && !user ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn-nav btn-login">
                Sign in
              </Link>
              <Link to="/signup" className="btn-nav btn-signup">
                Sign up
              </Link>
            </div>
          ) : !loading && user ? (
            <div className="auth-buttons">
              <span className="user-greeting">
                <i className="fa-solid fa-circle-user"></i>
                {user.name || user.email?.split("@")[0]}
              </span>
              <button onClick={handleLogout} className="btn-nav btn-logout">
                Logout
              </button>
            </div>
          ) : null}

          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <div className={`mobile-overlay${menuOpen ? " show" : ""}`} onClick={() => setMenuOpen(false)}></div>
      <div className={`mobile-menu${menuOpen ? " show" : ""}`}>
        <div className="mobile-menu-inner">
          <form className="mobile-search" onSubmit={handleSearch}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search dishes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <ul className="mobile-nav-links">
            <li><Link to="/" className={isActive("/") ? "active" : ""} onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/menu" className={isActive("/menu") ? "active" : ""} onClick={() => setMenuOpen(false)}>Menu</Link></li>
            <li>
              <Link to="/cart" className={isActive("/cart") ? "active" : ""} onClick={() => setMenuOpen(false)}>
                Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </li>
          </ul>

          <div className="mobile-auth">
            {!loading && !user ? (
              <>
                <Link to="/login" className="btn-nav btn-login" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link to="/signup" className="btn-nav btn-signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
              </>
            ) : !loading && user ? (
              <>
                <span className="user-greeting">
                  <i className="fa-solid fa-circle-user"></i>
                  {user.name || user.email?.split("@")[0]}
                </span>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn-nav btn-logout">Logout</button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
