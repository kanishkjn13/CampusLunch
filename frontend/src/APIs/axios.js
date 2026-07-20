import axios from "axios";

export const getBaseURL = () => {
  const host = window.location.hostname;
  if (
    host === 'localhost' || 
    host === '127.0.0.1' || 
    host.startsWith('192.168.') || 
    host.startsWith('10.') || 
    host.startsWith('172.') || 
    host.endsWith('.local')
  ) {
    return `http://${host === 'localhost' ? '127.0.0.1' : host}:8000/api`;
  }
  return "https://campuslunch-backend.onrender.com/api";
};

export const getMediaBaseURL = () => {
  const host = window.location.hostname;
  if (
    host === 'localhost' || 
    host === '127.0.0.1' || 
    host.startsWith('192.168.') || 
    host.startsWith('10.') || 
    host.startsWith('172.') || 
    host.endsWith('.local')
  ) {
    return `http://${host === 'localhost' ? '127.0.0.1' : host}:8000`;
  }
  return "https://campuslunch-backend.onrender.com";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically & ensure dynamic baseURL
api.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle automatic token refresh on 401 errors
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleForceLogout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  window.location.href = "/login";
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Intercept 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        handleForceLogout();
        return Promise.reject(error);
      }

      try {
        // Fetch new access token using standard axios (to prevent infinite loops)
        const response = await axios.post(`${getBaseURL()}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem("access", newAccessToken);

        // If rotation is configured, backend might return a new refresh token too
        if (response.data.refresh) {
          localStorage.setItem("refresh", response.data.refresh);
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleForceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
