import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

console.log("[apiClient] baseURL =", apiClient.defaults.baseURL);

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // session expired or invalid token
      alert("Session expired, please log in again.");
      localStorage.removeItem("token");
      setAuthToken(null);
      // force a reload or navigate to root
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}
