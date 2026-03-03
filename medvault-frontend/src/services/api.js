import axios from "axios";

const API = axios.create({
  baseURL: "https://medivault-lp09.onrender.com/api",
});

// Attach JWT automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;