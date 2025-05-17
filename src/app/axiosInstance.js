import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/v1/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log("🚀 Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response);
    return response;
  },
  (error) => {
    console.log("❌ Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;