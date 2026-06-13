import { useEffect, useState } from "react";
import "../App.css";
import { endpoints } from "../api/config.js";
import useAuthFetch from "../hooks/useAuthFetch.js";
import useNotification from "../hooks/useNotification.js";
import Loader from "./Loader.jsx";

function Dashboard() {
    const authFetch = useAuthFetch();
    const notify = useNotification();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const res = await authFetch(endpoints.dashboard);
                const body = await res.json();
                if (!res.ok) {
                    throw new Error(body.error || "Failed to load dashboard");
                }
                setStats(body.data);
            } catch (err) {
                console.error(err);
                notify.error(err.message || "Something went wrong while loading dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const coursesWithCounts = stats?.coursesWithCounts ?? [];

    return (
        <div className="dashboard-page">
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">
                Overview powered by Prisma (v2 API)
            </p>

            <div className="loader-section dashboard-loader">
                <Loader loading={loading} />

                {stats && (
                    <>
                        <div className="dashboard-stats">
                            <div className="stat-card">
                                <span className="stat-label">Courses</span>
                                <span className="stat-value">{stats.courses}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Students</span>
                                <span className="stat-value">{stats.students}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Enrollments</span>
                                <span className="stat-value">{stats.enrollments}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Assignments</span>
                                <span className="stat-value">{stats.assignments}</span>
                            </div>
                        </div>

                        <section className="dashboard-section">
                            <h2>Course enrollment</h2>
                            {coursesWithCounts.length === 0 ? (
                                <p className="dashboard-empty">No courses yet.</p>
                            ) : (
                                <ul className="dashboard-course-list">
                                    {coursesWithCounts.map((course) => {
                                        const enrolled = course._count.enrollments;
                                        const percent = course.capacity
                                            ? Math.min(100, Math.round((enrolled / course.capacity) * 100))
                                            : 0;
                                        const isFull = enrolled >= course.capacity;
                                        const isNearCapacity = percent >= 90 && !isFull;

                                        return (
                                            <li
                                                key={course.id}
                                                className={`dashboard-course-item${isFull ? " full" : ""}${isNearCapacity ? " near-capacity" : ""}`}
                                            >
                                                <div className="dashboard-course-header">
                                                    <div>
                                                        <strong>{course.code}</strong>
                                                        <span className="dashboard-course-title">{course.title}</span>
                                                    </div>
                                                    <span className="dashboard-course-count">
                                                        {enrolled} / {course.capacity}
                                                    </span>
                                                </div>
                                                <div className="dashboard-progress-track">
                                                    <div
                                                        className="dashboard-progress-fill"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                {isFull && (
                                                    <span className="dashboard-badge full">At capacity</span>
                                                )}
                                                {isNearCapacity && (
                                                    <span className="dashboard-badge near">Near capacity</span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
