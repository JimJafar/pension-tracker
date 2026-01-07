import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: `${apiUrl}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;
