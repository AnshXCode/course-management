import { useEffect } from 'react';
import '../App.css';
import { endpoints } from "../api/config.js";
import useAuthFetch from "../hooks/useAuthFetch.js";
import useNotification from "../hooks/useNotification.js";
import Loader from "./Loader.jsx";
import { useQuery } from "@tanstack/react-query";

const levelColor = {
    error: "#ef4444",
    warn: "#f59e0b",
};

const Logs = () => {
    const authFetch = useAuthFetch();
    const notify = useNotification();
    const {
        data: logs = [],
        isLoading: logsLoading,
        isError: logsError,
        error: logsFetchError,
    } = useQuery({
        queryKey: ["logs"],
        queryFn: async () => {
            const res = await authFetch(endpoints.logs);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch logs");
            }
            return data.data ?? [];
        },
        refetchInterval: 5000,
    });

    useEffect(() => {
        if (logsError) {
            notify.error(logsFetchError?.message || "Failed to fetch logs");
        }
    }, [logsError, logsFetchError, notify]);

    return (
        <div style={{ padding: "0px 24px" }}>
            <h1>Logs</h1>
            <div className="loader-section" style={{ minHeight: logsLoading ? "6rem" : undefined }}>
                <Loader loading={logsLoading} />
                {logs.length === 0 && !logsLoading ? (
                    <p style={{ color: "#888" }}>No error or warning logs yet.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {logs.map((entry) => (
                            <li
                                key={entry.id}
                                style={{
                                    marginBottom: "0.75rem",
                                    padding: "0.75rem",
                                    border: "1px solid #2a2a2a",
                                    borderRadius: "8px",
                                }}
                            >
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline", flexWrap: "wrap" }}>
                                    <span
                                        style={{
                                            color: levelColor[entry.level] ?? "#888",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        {entry.level}
                                    </span>
                                    <span style={{ color: "#888", fontSize: "0.85rem" }}>{entry.timestamp}</span>
                                    <span style={{ color: "#888", fontSize: "0.85rem" }}>{entry.statusCode}</span>
                                </div>
                                <p style={{ margin: "0.35rem 0 0" }}>{entry.message}</p>
                                <p style={{ margin: "0.25rem 0 0", color: "#888", fontSize: "0.85rem" }}>
                                    {entry.method} {entry.path}
                                    {entry.userEmail ? ` · ${entry.userEmail}` : ""}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Logs;
