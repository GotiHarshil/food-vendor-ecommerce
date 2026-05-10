import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Admin.css";

const NAV_ITEMS = [
  { path: "/admin", icon: "fa-solid fa-chart-line", label: "Dashboard", exact: true },
  { path: "/admin/orders", icon: "fa-solid fa-receipt", label: "Orders" },
  { path: "/admin/items", icon: "fa-solid fa-burger", label: "Menu Items" },
  { path: "/admin/users", icon: "fa-solid fa-users", label: "Users" },
  { path: "/admin/settings", icon: "fa-solid fa-gear", label: "Settings" },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user/status", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role === "admin") {
          setUser(data.user);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-brand">
            <span className="admin-brand-icon">M</span>
            <span className="admin-brand-text">MANU Admin</span>
          </Link>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item${isActive(item) ? " active" : ""}`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="fa-solid fa-bars"></i>
          </button>
          <div className="admin-topbar-right">
            <span className="admin-user">
              <i className="fa-solid fa-circle-user"></i>
              {user.name || user.email}
            </span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
