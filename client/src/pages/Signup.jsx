<<<<<<< HEAD
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      if (response.ok) {
        navigate("/menu");
      } else {
        const data = await response.json();
        setError(data.message || data.error || "An error occurred");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
=======
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/auth-context";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not create account");
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
          <i className="fa-solid fa-user-plus"></i>
        </div>

        <div className="auth-header">
          <h2>Create Account</h2>
        </div>
        <p className="auth-sub">Join us and start ordering your favorites</p>

        {error && (
          <div className="errors">
            <i className="fa-solid fa-circle-exclamation"></i>
=======
    <AuthLayout
      title="Create an account"
      subtitle="Start ordering in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 font-bold hover:underline">
            Sign in
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
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span className="muted">Already have an account? </span>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
=======
        <Input
          label="Full name"
          name="username"
          required
          value={form.username}
          onChange={update("username")}
          leftIcon={<User className="w-4 h-4" />}
          placeholder="Jane Doe"
        />

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
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          leftIcon={<Lock className="w-4 h-4" />}
          placeholder="At least 6 characters"
          hint="Use at least 6 characters."
        />

        <Input
          label="Confirm password"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={form.confirm}
          onChange={update("confirm")}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
>>>>>>> claude/condescending-swirles-7a4876
  );
}
