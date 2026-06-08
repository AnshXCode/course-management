import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { getToken } from "../api/config.js";

export default function useAuthFetch() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function authFetch(url, options = {}) {
        const token = getToken();
        const headers = {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            logout();
            navigate("/login", { replace: true });
        }

        return response;
    }

    return authFetch;
}
