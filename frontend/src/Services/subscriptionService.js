import api from "../APIs/axios";

// Student endpoints
export const createSubscription = async (data) => {
  const response = await api.post("/students/subscriptions/", data);
  return response.data;
};

export const getStudentSubscriptions = async (status = "") => {
  const params = {};
  if (status) params.status = status;
  const response = await api.get("/students/subscriptions/", { params });
  return response.data;
};

export const pauseSubscription = async (id) => {
  const response = await api.post(`/students/subscriptions/${id}/pause/`);
  return response.data;
};

export const resumeSubscription = async (id) => {
  const response = await api.post(`/students/subscriptions/${id}/resume/`);
  return response.data;
};

export const cancelSubscription = async (id) => {
  const response = await api.post(`/students/subscriptions/${id}/cancel/`);
  return response.data;
};

// Vendor endpoints
export const getVendorSubscribers = async (search = "", status = "") => {
  const params = {};
  if (search) params.search = search;
  if (status) params.status = status;
  const response = await api.get("/vendors/subscriptions/", { params });
  return response.data;
};
