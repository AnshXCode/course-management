import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { endpoints } from "../api/config.js";
import { useAuth } from "../context/AuthProvider.jsx";
import useNotification from "../hooks/useNotification.js";
import Loader from "./Loader.jsx";

export default function Login() {
  const [login, setLogin] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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

      saveAuth(data.accessToken, data.refreshToken, data.user);
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
          <div className="auth-password-field">
            <input
              name="password"
              value={login.password}
              type={showPassword ? "text" : "password"}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isSubmitting}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
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
