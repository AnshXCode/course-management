const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

const endpoints = {
    courses: `${API_BASE}/courses`,
    students: `${API_BASE}/students`,
    enrollments: `${API_BASE}/enrollments`,
    dashboard: `${API_BASE}/v2/dashboard`,
    auth: `${API_BASE}/auth`,
    logs: `${API_BASE}/v2/logs`,
    payments: `${API_BASE}/payments`,
};

export function formatPrice(cents) {
    if (cents == null || cents <= 0) return "Free";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

const getAccessToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");

const getUser = () => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
};

const setAuth = (accessToken, refreshToken, user) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("user", JSON.stringify(user));
};

const clearToken = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
};

const tryRefresh = async() => {
    const refreshToken = getRefreshToken();
    if(!refreshToken) return false;
    
    const res = await fetch(`${endpoints.auth}/refresh`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({refreshToken})
    })
    const result = await res.json();
    const {accessToken, refreshToken: rf, user} = result
    console.log(result, res.ok, 'RESULT')
    if(res.ok){
        setAuth(accessToken, rf, user);
        return true
    }
    return false
}   

export { endpoints, clearToken, getAccessToken, getRefreshToken, getUser, setAuth, tryRefresh };
