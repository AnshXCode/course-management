import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { getAccessToken, tryRefresh } from "../api/config.js";

export default function useAuthFetch() {
    
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function authFetch(url, options = {}) {
        let accessToken = getAccessToken();
      
        const doFetch = (token) =>
          fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
      
        let response = await doFetch(accessToken);
      
        // Access expired — try refresh once
        if (response.status === 401) {
          const refreshed = await tryRefresh(); // POST /auth/refresh
          if (refreshed) {
            accessToken = getAccessToken();
            response = await doFetch(accessToken);
          } else {
            logout();
            navigate("/login", { replace: true });
          }
        }
        return response;
      }

    return authFetch;
}
