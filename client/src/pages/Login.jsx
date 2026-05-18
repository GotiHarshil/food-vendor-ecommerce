<<<<<<< HEAD
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        navigate("/menu");
      } else {
        const data = await response.json();
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
=======
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/auth-context";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form);
      const next = location.state?.from || "/";
      navigate(next);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
>>>>>>> claude/condescending-swirles-7a4876
    }
  };

  return (
<<<<<<< HEAD
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-icon">
          <i className="fa-solid fa-right-to-bracket"></i>
        </div>

        <div className="auth-header">
          <h2>Welcome back</h2>
        </div>
        <p className="auth-sub">Sign in to your account to continue</p>

        {error && (
          <div className="errors">
            <i className="fa-solid fa-circle-exclamation"></i>
=======
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand-600 font-bold hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-3">
>>>>>>> claude/condescending-swirles-7a4876
            {error}
          </div>
        )}

<<<<<<< HEAD
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

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span className="muted">Don't have an account? </span>
          <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
=======
        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          leftIcon={<Mail className="w-4 h-4" />}
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={form.password}
          onChange={update("password")}
          leftIcon={<Lock className="w-4 h-4" />}
          placeholder="••••••••"
        />

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
>>>>>>> claude/condescending-swirles-7a4876
  );
}
