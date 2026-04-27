import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const isPublicAuthEndpoint = (url = "") =>
  PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isQrVerifyPage = window.location.pathname.startsWith("/qr-verify/");

    if (status === 401 && !isPublicAuthEndpoint(requestUrl) && !isQrVerifyPage) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default API;
