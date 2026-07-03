import api from "../APIs/axios";

export const loginUser = async (email, password) => {

    const response = await api.post("/auth/login/", {
        email,
        password,
    });

    return response.data;
};

export const studentRegister = async (userData) => {

    const response = await api.post("/auth/register/student/", userData);
    
    return response.data;
};