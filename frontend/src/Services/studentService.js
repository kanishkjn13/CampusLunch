import api from "../APIs/axios";

// Fetch active vendors with optional search and filters
export const getVendors = async (search = "", mealType = "", foodType = "") => {
  const params = {};
  if (search) params.search = search;
  if (mealType && mealType !== "All") params.meal_type = mealType;
  if (foodType && foodType !== "All") params.food_type = foodType;

  const response = await api.get("/students/vendors/", { params });
  return response.data;
};

// Fetch details and menu items for a single vendor
export const getVendorDetails = async (id) => {
  const response = await api.get(`/students/vendors/${id}/`);
  return response.data;
};

// Fetch orders
export const getOrders = async () => {
  const response = await api.get("/vendors/orders/");
  return response.data;
};

// Place a new order
export const placeOrderApi = async (orderData) => {
  const response = await api.post("/vendors/orders/", orderData);
  return response.data;
};

// Update order status (used by vendor dashboard)
export const updateOrderApi = async (id, orderData) => {
  const response = await api.patch(`/vendors/orders/${id}/`, orderData);
  return response.data;
};

// Fetch active order trackers
export const getTrackers = async () => {
  const response = await api.get("/vendors/trackers/");
  return response.data;
};

// Update tracker status (used by vendor dashboard)
export const updateOrderTrackerApi = async (id, trackerData) => {
  const response = await api.patch(`/vendors/trackers/${id}/`, trackerData);
  return response.data;
};

// Fetch all ratings
export const getRatings = async () => {
  const response = await api.get("/vendors/ratings/");
  return response.data;
};

// Submit feedback rating
export const submitRatingApi = async (ratingData) => {
  const response = await api.post("/vendors/ratings/", ratingData);
  return response.data;
};
