import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Form states
  const [infoForm, setInfoForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        fetch("/api/user/profile", { credentials: "include" }),
        fetch("/api/food/my-orders", { credentials: "include" }),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
        setInfoForm({ name: profileData.name, phone: profileData.phone });
      } else {
        setError("Failed to load profile");
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (err) {
      setError("Error loading profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (favorites.length > 0) return; // Already loaded
    setFavoritesLoading(true);
    try {
      const res = await fetch("/api/user/favorites", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Error loading favorites:", err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setInfoLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infoForm),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(data.error || "Failed to update profile");
      }
    } catch (err) {
      setErrorMsg("Error saving profile: " + err.message);
    } finally {
      setInfoLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(data.error || "Failed to change password");
      }
    } catch (err) {
      setErrorMsg("Error changing password: " + err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUnfavorite = async (foodId) => {
    try {
      const res = await fetch(`/api/user/favorites/${foodId}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f._id !== foodId));
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchUserData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>
          <i className="fa-solid fa-user"></i> My Profile
        </h1>
      </div>

      {successMsg && (
        <div className="success-message">
          <i className="fa-solid fa-check-circle"></i>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="error-message">
          <i className="fa-solid fa-exclamation-circle"></i>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="profile-tabs">
        <button
          className={`tab-button${activeTab === "info" ? " active" : ""}`}
          onClick={() => {
            setActiveTab("info");
            setErrorMsg("");
            setSuccessMsg("");
          }}
        >
          <i className="fa-solid fa-user-pen"></i> Personal Info
        </button>
        <button
          className={`tab-button${activeTab === "password" ? " active" : ""}`}
          onClick={() => {
            setActiveTab("password");
            setErrorMsg("");
            setSuccessMsg("");
          }}
        >
          <i className="fa-solid fa-key"></i> Change Password
        </button>
        <button
          className={`tab-button${activeTab === "favorites" ? " active" : ""}`}
          onClick={() => {
            setActiveTab("favorites");
            setErrorMsg("");
            setSuccessMsg("");
            fetchFavorites();
          }}
        >
          <i className="fa-solid fa-heart"></i> Favorites
        </button>
      </div>

      {/* Personal Info Tab */}
      {activeTab === "info" && (
        <div className="tab-content">
          <div className="profile-card">
            <h3>Personal Information</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={infoForm.name}
                  onChange={handleInfoChange}
                  placeholder="Your name"
                  required
                  disabled={infoLoading}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  placeholder="Your email"
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={infoForm.phone}
                  onChange={handleInfoChange}
                  placeholder="Your phone number"
                  disabled={infoLoading}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={infoLoading}
              >
                {infoLoading ? (
                  <>
                    <span className="btn-spinner-sm"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk"></i>
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <div className="tab-content">
          <div className="profile-card">
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                  disabled={passwordLoading}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 chars)"
                  required
                  disabled={passwordLoading}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  disabled={passwordLoading}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <>
                    <span className="btn-spinner-sm"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock"></i>
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === "favorites" && (
        <div className="tab-content">
          <div className="profile-card">
            <h3>Your Favorites</h3>
            {favoritesLoading ? (
              <div className="loading-spinner"></div>
            ) : favorites.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-heart"></i>
                <p>No favorites yet</p>
                <p className="muted">Browse the menu and heart items to add them here</p>
                <Link to="/menu" className="btn-shop-now">
                  <i className="fa-solid fa-utensils"></i>
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="favorites-grid">
                {favorites.map((food) => (
                  <div key={food._id} className="favorite-card">
                    <div className="fc-image">
                      <img src={food.imageUrl} alt={food.name} />
                      <button
                        className="fc-unfavorite"
                        onClick={() => handleUnfavorite(food._id)}
                        title="Remove favorite"
                      >
                        <i className="fa-solid fa-heart"></i>
                      </button>
                    </div>
                    <div className="fc-info">
                      <h4>{food.name}</h4>
                      <p className="price">${food.price.toFixed(2)}</p>
                      <Link to="/menu" className="btn-add-to-cart">
                        <i className="fa-solid fa-bag-shopping"></i>
                        View & Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="profile-card order-history-card">
        <div className="section-header">
          <h3>
            <i className="fa-solid fa-receipt"></i> Recent Orders
          </h3>
          {orders.length > 5 && (
            <Link to="/my-orders" className="view-all-link">
              View All Orders
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-shopping-bag"></i>
            <p>No orders yet</p>
            <p className="muted">Start ordering to see your order history</p>
          </div>
        ) : (
          <div className="orders-list">
            {recentOrders.map((order) => (
              <div key={order._id} className="order-item">
                <div className="order-info">
                  <div>
                    <strong>Order #{String(order._id).slice(-6).toUpperCase()}</strong>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="order-details">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <strong className="order-total">
                    ${order.subtotal.toFixed(2)}
                  </strong>
                </div>
                <Link to={`/orders/${order._id}`} className="btn-view-order">
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
