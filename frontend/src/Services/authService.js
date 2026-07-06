import api from "../APIs/axios";

// Login
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login/", {
    email,
    password,
  });

  return response.data;
};

// Student Register
export const studentRegister = async (userData) => {
  const response = await api.post("/auth/register/student/", userData);
  return response.data;
};

// Vendor Register
export const vendorRegister = async (userData) => {
  const response = await api.post(
    "/auth/register/vendor/",
    userData
  );

  return response.data;
};

// Forgot Password
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password/", {
    email,
  });

  return response.data;
};

// Reset Password
export const resetPassword = async (data) => {
  const response = await api.post(
    "/auth/reset-password/",
    data
  );

  return response.data;
};

// Change Password
export const changePassword = async (data) => {
  const response = await api.post(
    "/auth/change-password/",
    data
  );

  return response.data;
};