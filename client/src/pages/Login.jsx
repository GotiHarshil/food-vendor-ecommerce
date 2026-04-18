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
    }
  };

  return (
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
            {error}
          </div>
        )}

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
  );
}
