import { createContext, useContext, useState } from "react";
import { clearToken, getToken, getUser, setAuth } from "../api/config.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => (getToken() ? getUser() : null));

    const login = (token, userData) => {
        setAuth(token, userData);
        setUser(userData);
    };

    const logout = () => {
        clearToken();
        setUser(null);
    };

    const isAuthenticated = !!user && !!getToken();

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
