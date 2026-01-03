import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const tenant = localStorage.getItem("tenantSubdomain");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenant) {
      config.headers["x-tenant-subdomain"] = tenant;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
