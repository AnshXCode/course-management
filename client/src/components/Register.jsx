import { useState } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../api/config.js";
import useNotification from "../hooks/useNotification.js";
import Loader from "./Loader.jsx";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [registered, setRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${endpoints.auth}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || "Registration failed");
        return;
      }

      setRegistered(true);
      notify.success("Check your email to verify your account");
    } catch {
      notify.error("Could not register");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (registered) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Check your email</h1>
          <p className="auth-message">
            We sent a verification link to <strong>{form.email}</strong>.
            Click the link in the email, then log in.
          </p>
          <Link className="auth-link" to="/login">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card loader-section">
        <Loader loading={isSubmitting} />
        <h1>Register</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            autoComplete="email"
            required
            disabled={isSubmitting}
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete="new-password"
            required
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>Create account</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
