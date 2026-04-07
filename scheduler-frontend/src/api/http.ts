import axios from "axios";

// export const http = axios.create({
//   baseURL: "http://localhost:3000", 
//   timeout: 5000,
// });

export const http = axios.create({
  baseURL: "/api",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

