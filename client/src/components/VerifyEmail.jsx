import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { endpoints } from "../api/config.js";
import Loader from "./Loader.jsx";

export default function VerifyEmail() {
  const { verifyToken } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!verifyToken) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    fetch(`${endpoints.auth}/verify-email/${verifyToken}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
          return;
        }
        setStatus("success");
        setMessage(data.info || "Email verified. You can log in now.");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [verifyToken]);

  return (
    <div className="auth-page">
      <div className="auth-card loader-section">
        <Loader loading={status === "loading"} />
        <h1>Email verification</h1>
        {status === "loading" && <p className="auth-message">Verifying...</p>}
        {status !== "loading" && (
          <p className={`auth-message ${status === "error" ? "auth-error" : ""}`}>
            {message}
          </p>
        )}
        {status === "success" && (
          <Link className="auth-link" to="/login">
            Go to login
          </Link>
        )}
        {status === "error" && (
          <Link className="auth-link" to="/login">
            Back to login
          </Link>
        )}
      </div>
    </div>
  );
}
