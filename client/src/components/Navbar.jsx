import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchDropdown from "./SearchDropdown";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { cartCount, refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchWrapperRef = useRef(null);

  useEffect(() => {
    checkUserStatus();
    refreshCart();
    setMenuOpen(false);
  }, [location, refreshCart]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };

    if (searchFocused) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [searchFocused]);

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
          <img
            src="/brand-logo.png"
            alt="Food Truck Logo"
            className="brand-icon"
          />
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
              <Link
                to="/cart"
                className={`cart-link${isActive("/cart") ? " active" : ""}`}
              >
                <i className="fa-solid fa-bag-shopping"></i>
                Cart
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to="/my-orders"
                  className={isActive("/my-orders") ? "active" : ""}
                >
                  Orders
                </Link>
              </li>
            )}
            {user?.role === "admin" && (
              <li>
                <Link to="/admin" className="admin-link">
                  <i className="fa-solid fa-shield-halved"></i>
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="nav-right">
          <div className="nav-search-wrapper" ref={searchWrapperRef}>
            <form className="nav-search" onSubmit={handleSearch}>
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                placeholder="Search dishes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
              />
            </form>
            <SearchDropdown
              query={query}
              onSelect={() => {
                setQuery("");
                setSearchFocused(false);
              }}
              isFocused={searchFocused}
            />
          </div>

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
              <Link to="/profile" className="btn-profile" title="View Profile">
                <i className="fa-solid fa-user"></i>
              </Link>
              <span className="user-greeting">
                <i className="fa-solid fa-circle-user"></i>
                {user.name || user.email?.split("@")[0]}
              </span>
              <button onClick={handleLogout} className="btn-nav btn-logout">
                Logout
              </button>
            </div>
          ) : null}

          <Link to="/cart" className="mobile-cart-icon" title="Go to Cart">
            <i className="fa-solid fa-bag-shopping"></i>
            {cartCount > 0 && (
              <span className="mobile-cart-badge">{cartCount}</span>
            )}
          </Link>

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
      <div
        className={`mobile-overlay${menuOpen ? " show" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>
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
            <li>
              <Link
                to="/"
                className={isActive("/") ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/menu"
                className={isActive("/menu") ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                Menu
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className={isActive("/cart") ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                Cart{" "}
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>
            </li>
            {user && (
              <>
                <li>
                  <Link
                    to="/profile"
                    className={isActive("/profile") ? "active" : ""}
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="fa-solid fa-user"></i>
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-orders"
                    className={isActive("/my-orders") ? "active" : ""}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                </li>
              </>
            )}
            {user?.role === "admin" && (
              <li>
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: "var(--primary)" }}
                >
                  <i className="fa-solid fa-shield-halved"></i> Admin Panel
                </Link>
              </li>
            )}
          </ul>

          <div className="mobile-auth">
            {!loading && !user ? (
              <>
                <Link
                  to="/login"
                  className="btn-nav btn-login"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="btn-nav btn-signup"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            ) : !loading && user ? (
              <>
                <span className="user-greeting">
                  <i className="fa-solid fa-circle-user"></i>
                  {user.name || user.email?.split("@")[0]}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="btn-nav btn-logout"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
