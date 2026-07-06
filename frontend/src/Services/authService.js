import api from "../APIs/axios";

// Login
export const loginUser = async (email, password) => {
    const response = await api.post("/auth/login/", {
        email,
        password,
    });

    return response.data;
};

//student

export const studentRegister = async (userData) => {
    const response = await api.post("/auth/register/student/", userData);
    return response.data;
};

//vendor
export const vendorRegister = async (userData) => {
    const response = await api.post(
        "/auth/register/vendor/",
        userData
    );

    return response.data;
};
// forgot pass
export const forgotPassword = async (email) => {
    const response = await api.post("/auth/forgot-password/", {
        email,
    });

    return response.data;
};