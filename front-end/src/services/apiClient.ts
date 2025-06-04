import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // should now be "http://localhost:3000/api"
});

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}
