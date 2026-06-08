import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { endpoints } from "../api/config.js";
import { useAuth } from "../context/AuthProvider.jsx";
import useNotification from "../hooks/useNotification.js";
import Loader from "./Loader.jsx";

export default function Login() {
  const [login, setLogin] = useState({ email: "", password: "" });
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const notify = useNotification();
  const navigate = useNavigate();
  const { login: saveAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNeedsVerification(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${endpoints.auth}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });

      const data = await res.json();

      if (res.status === 403) {
        setNeedsVerification(true);
        notify.error(data.error || "Please verify your email first");
        return;
      }

      if (!res.ok) {
        notify.error(data.error || "Login failed");
        return;
      }

      saveAuth(data.token, data.user);
      notify.success("Logged in successfully");
      navigate("/courses", { replace: true });
    } catch {
      notify.error("Not able to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!login.email) {
      notify.error("Enter your email first");
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch(`${endpoints.auth}/resend-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: login.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || "Could not resend email");
        return;
      }

      notify.success(data.info || "Verification email sent");
    } catch {
      notify.error("Could not resend email");
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (e) => {
    setLogin((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card loader-section">
        <Loader loading={isSubmitting || isResending} />
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="email"
            value={login.email}
            type="email"
            onChange={handleChange}
            placeholder="Email"
            autoComplete="email"
            required
            disabled={isSubmitting}
          />
          <input
            name="password"
            value={login.password}
            type="password"
            onChange={handleChange}
            placeholder="Password"
            autoComplete="current-password"
            required
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>Log in</button>
        </form>

        {needsVerification && (
          <div className="auth-verify-prompt">
            <p>Verify your email before logging in.</p>
            <button type="button" className="auth-secondary-btn" onClick={handleResend} disabled={isResending}>
              Resend verification email
            </button>
          </div>
        )}

        <p className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
