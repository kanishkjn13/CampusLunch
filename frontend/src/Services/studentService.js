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
