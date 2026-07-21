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

// Delete User Profile
export const deleteUserProfileApi = async () => {
  const response = await api.delete("/auth/profile/");
  return response.data;
};

// Send OTP
export const sendOTP = async (email) => {
  const response = await api.post("/send-otp/", { email });
  return response.data;
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  const response = await api.post("/verify-otp/", { email, otp });
  return response.data;
};

// Admin Vendor Management & Verification
export const getAdminVendorsList = async () => {
  const response = await api.get("/auth/admin/vendors/");
  return response.data;
};

export const verifyVendorApi = async (vendorId, action = "approve") => {
  const response = await api.post(`/auth/admin/vendors/${vendorId}/verify/`, { action });
  return response.data;
};

export const onboardVendorApi = async (vendorData) => {
  const response = await api.post("/auth/admin/vendors/onboard/", vendorData);
  return response.data;
};

// System Controls & Health APIs
export const getSystemHealthApi = async () => {
  const response = await api.get("/auth/system-health/");
  return response.data;
};

export const updateCommissionRateApi = async (commissionRate) => {
  const response = await api.post("/auth/system-health/", { commission_rate: commissionRate });
  return response.data;
};

// Admin Support Ticket APIs
export const getSupportTicketsApi = async () => {
  const response = await api.get("/auth/admin/support/tickets/");
  return response.data;
};

export const getSupportMessagesApi = async (ticketId) => {
  const response = await api.get(`/auth/admin/support/tickets/${ticketId}/messages/`);
  return response.data;
};

export const sendSupportMessageApi = async (ticketId, messageText, sender = "admin") => {
  const response = await api.post(`/auth/admin/support/tickets/${ticketId}/messages/`, { text: messageText, sender });
  return response.data;
};

export const updateTicketStatusApi = async (ticketId, status) => {
  const response = await api.post(`/auth/admin/support/tickets/${ticketId}/status/`, { status });
  return response.data;
};

// Profile & Security APIs
export const getUserProfileApi = async () => {
  const response = await api.get("/auth/profile/");
  return response.data;
};

export const changeUserPasswordApi = async (data) => {
  const response = await api.post("/auth/change-password/", data);
  return response.data;
};