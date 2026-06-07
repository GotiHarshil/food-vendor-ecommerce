import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./Auth.css";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Logout from all devices by clearing session
        await fetch("/api/user/logout", { method: "POST", credentials: "include" });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-icon">
          <i className="fa-solid fa-lock"></i>
        </div>

        <div className="auth-header">
          <h2>Reset Password</h2>
        </div>
        <p className="auth-sub">Enter your new password below</p>

        {error && (
          <div className="errors">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#dcfce7",
            border: "1px solid #22c55e",
            color: "#166534",
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            marginBottom: "16px",
            fontSize: "0.88rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <i className="fa-solid fa-check-circle"></i>
            {success}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i>
                  Reset Password
                </>
              )}
            </button>
          </form>
        ) : null}

        <div className="auth-footer">
          <span className="muted">Don't have a reset link? </span>
          <Link to="/forgot-password">Request One</Link>
        </div>
      </div>
    </div>
  );
}
