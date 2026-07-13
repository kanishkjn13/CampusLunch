import api from "../APIs/axios";

// Fetch menu items for the logged-in vendor
export const getMenuItems = async () => {
  const response = await api.get("/vendors/menu-items/");
  return response.data;
};

// Create a new menu item
export const addMenuItem = async (data) => {
  const config = {};
  if (data instanceof FormData) {
    config.headers = {
      "Content-Type": undefined,
    };
  }
  const response = await api.post("/vendors/menu-items/", data, config);
  return response.data;
};

// Update an existing menu item
export const updateMenuItem = async (id, data) => {
  const config = {};
  if (data instanceof FormData) {
    config.headers = {
      "Content-Type": undefined,
    };
  }
  const response = await api.patch(`/vendors/menu-items/${id}/`, data, config);
  return response.data;
};

// Delete a menu item
export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/vendors/menu-items/${id}/`);
  return response.data;
};
