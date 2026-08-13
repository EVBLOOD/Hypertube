import axios, { AxiosError } from "axios";
import { redirect } from "next/navigation";

const api = axios.create({
    baseURL: process.env.PUBLIC_API_URL || "http://localhost:8081/api/",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// api.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error: AxiosError) => {
//         if (error.response?.status === 401) {
//             redirect("/login");
//         }
//         return Promise.reject(error);
//     },
// );

export default api;
