import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import { endpoints, formatPrice } from "../api/config.js";
import useAuthFetch from "../hooks/useAuthFetch.js";
import useNotification from "../hooks/useNotification.js";
import Loader from "./Loader.jsx";

function MockPayment() {
    const { paymentId } = useParams();
    const authFetch = useAuthFetch();
    const navigate = useNavigate();
    const notify = useNotification();

    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [payment, setPayment] = useState(null);
    const [course, setCourse] = useState(null);
    const [error, setError] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadPayment() {
            setLoading(true);
            setError(null);
            try {
                const res = await authFetch(`${endpoints.payments}/${paymentId}`);
                const body = await res.json();
                if (!res.ok) {
                    throw new Error(body.error || "Failed to load payment");
                }

                if (cancelled) return;
                const paymentData = body.data;
                setPayment(paymentData);

                if (paymentData.status === "succeeded") {
                    setConfirmed(true);
                }

                if (paymentData.course_id) {
                    const courseRes = await authFetch(`${endpoints.courses}/${paymentData.course_id}`);
                    const courseBody = await courseRes.json();
                    if (courseRes.ok && !cancelled) {
                        setCourse(courseBody);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Something went wrong");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPayment();
        return () => {
            cancelled = true;
        };
    }, [paymentId, authFetch]);

    const handleConfirm = async () => {
        setConfirming(true);
        setError(null);
        try {
            const res = await authFetch(`${endpoints.payments}/${paymentId}/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }),
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.error || "Payment confirmation failed");
            }

            setPayment(body.data.payment);
            setConfirmed(true);
            notify.success(
                body.data.alreadyConfirmed
                    ? "Payment was already completed"
                    : "Payment confirmed — you are enrolled!"
            );
        } catch (err) {
            setError(err.message || "Something went wrong");
            notify.error(err.message || "Payment confirmation failed");
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div style={{ padding: "0 24px", maxWidth: "32rem" }}>
            <p style={{ marginBottom: "1rem" }}>
                <Link to="/courses">← Back to courses</Link>
            </p>
            <h1>Mock payment</h1>
            <p style={{ color: "#888", marginBottom: "1.5rem" }}>
                Simulated checkout — no card required. Confirm below to complete enrollment.
            </p>

            <div className="loader-section" style={{ minHeight: loading ? "8rem" : undefined }}>
                <Loader loading={loading} />

                {!loading && error && !payment && (
                    <p style={{ color: "#ef4444" }}>{error}</p>
                )}

                {!loading && payment && (
                    <div className="stat-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
                        <p><strong>Payment #{payment.id}</strong></p>
                        <p>Status: <strong>{payment.status}</strong></p>
                        <p>Amount: <strong>{formatPrice(payment.amount_cents)}</strong></p>
                        {course && (
                            <p>Course: <strong>{course.title}</strong> ({course.code})</p>
                        )}
                    </div>
                )}

                {!loading && payment?.status === "pending" && (
                    <>
                        {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={confirming}
                            style={{ marginRight: "0.75rem" }}
                        >
                            {confirming ? "Confirming…" : "Confirm payment"}
                        </button>
                        <button type="button" onClick={() => navigate("/courses")} disabled={confirming}>
                            Cancel
                        </button>
                    </>
                )}

                {!loading && confirmed && (
                    <div>
                        <p style={{ color: "#22c55e", marginBottom: "1rem" }}>
                            Enrollment complete. You can view it on the enrollments page.
                        </p>
                        <Link to="/enrollments">Go to enrollments</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MockPayment;
