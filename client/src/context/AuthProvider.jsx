import { createContext, useContext, useState } from "react";
import { clearToken, getAccessToken, getUser, setAuth, getRefreshToken, endpoints } from "../api/config.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => (getAccessToken() ? getUser() : null));

    const login = (accessToken, refreshToken, userData) => {
        setAuth(accessToken, refreshToken, userData);
        setUser(userData);
    };

    const logout = async () => {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            await fetch(`${endpoints.auth}/logout`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ refreshToken }),
            })
        }
        clearToken();
        setUser(null);
    };

    const isAuthenticated = !!user && !!getAccessToken();

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook exported alongside provider — standard Context pattern
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const auth = useContext(AuthContext);
    if (!auth) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return auth;
}
