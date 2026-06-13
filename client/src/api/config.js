const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

const endpoints = {
    courses: `${API_BASE}/courses`,
    students: `${API_BASE}/students`,
    enrollments: `${API_BASE}/enrollments`,
    dashboard: `${API_BASE}/v2/dashboard`,
    auth: `${API_BASE}/auth`,
};

const getToken = () => localStorage.getItem("token");

const getUser = () => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
};

const setAuth = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
};

const clearToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export { endpoints, clearToken, getToken, getUser, setAuth };
