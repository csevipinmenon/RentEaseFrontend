import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("rentease_user") || "null");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ---- Auth ----
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/profile");
export const updateProfile = (data) => API.put("/auth/profile", data);

// ---- Products ----
export const getProducts = (params) => API.get("/products", { params });
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post("/products", data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// ---- Rentals ----
export const createRental = (data) => API.post("/rentals", data);
export const getMyRentals = () => API.get("/rentals/my");
export const getRentalById = (id) => API.get(`/rentals/${id}`);
export const requestReturn = (id, data) =>
  API.put(`/rentals/${id}/return`, data);
export const getAllRentals = (params) => API.get("/rentals", { params });
export const updateRentalStatus = (id, status) =>
  API.put(`/rentals/${id}/status`, { status });

// ---- Maintenance ----
export const createMaintenanceRequest = (data) =>
  API.post("/maintenance", data);
export const getMyMaintenanceRequests = () => API.get("/maintenance/my");
export const getAllMaintenanceRequests = () => API.get("/maintenance");
export const updateMaintenanceRequest = (id, data) =>
  API.put(`/maintenance/${id}`, data);

// ---- Admin ----
export const getAdminDashboard = () => API.get("/admin/stats");
export const getAllUsers = (params) => API.get("/admin/users", { params });
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle`);
export const getServiceAreas = () => API.get("/admin/service-areas");
export const createServiceArea = (data) =>
  API.post("/admin/service-areas", data);
export const updateServiceArea = (id, data) =>
  API.put(`/admin/service-areas/${id}`, data);
export const deleteServiceArea = (id) =>
  API.delete(`/admin/service-areas/${id}`);

export default API;
