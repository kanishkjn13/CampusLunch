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

//logout
export const logoutUser = async () => {
  const refresh = localStorage.getItem("refresh");

  const response = await api.post("/auth/logout/", {
    refresh,
  });

  return response.data;
};

// Get User Profile
export const getUserProfile = async () => {
  const response = await api.get("/auth/profile/");
  return response.data;
};

// Update User Profile
export const updateUserProfileApi = async (data) => {
  const config = {};
  if (data instanceof FormData) {
    config.headers = {
      "Content-Type": undefined,
    };
  }
  const response = await api.put("/auth/profile/", data, config);
  return response.data;
};

// Send OTP
export const sendOTP = async (email) => {
  const response = await api.post("/auth/otp/send/", { email });
  return response.data;
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  const response = await api.post("/auth/otp/verify/", { email, otp });
  return response.data;
};

// Resend OTP
export const resendOTP = async (email) => {
  const response = await api.post("/auth/otp/resend/", { email });
  return response.data;
};