import axios from "axios";

// export const http = axios.create({
//   baseURL: "http://localhost:3000", 
//   timeout: 5000,
// });

export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshRes = await http.post("/auth/refresh");
        const newAccessToken = refreshRes.data.access_token;

        sessionStorage.setItem("access_token", newAccessToken);

        original.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return http(original);
      } catch (err) {
        sessionStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);