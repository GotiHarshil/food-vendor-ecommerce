import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setEmail("");
      } else {
        setError(data.error || "Failed to process request");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-icon">
          <i className="fa-solid fa-key"></i>
        </div>

        <div className="auth-header">
          <h2>Forgot Password?</h2>
        </div>
        <p className="auth-sub">Enter your email to receive password reset instructions</p>

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
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-envelope"></i>
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        ) : null}

        <div className="auth-footer">
          <span className="muted">Remember your password? </span>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
