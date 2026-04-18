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
    }
  };

  return (
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
            {error}
          </div>
        )}

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
  );
}
