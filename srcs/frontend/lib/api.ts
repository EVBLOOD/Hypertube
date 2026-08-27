import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACK_API_URL || "",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const getCookie = (name: string) => {
        const match = document.cookie.match(
            new RegExp("(^| )" + name + "=([^;]*)"),
        );
        return match ? decodeURIComponent(match[2]) : null;
    };
    if (typeof window !== "undefined") {
        const lang = getCookie("NEXT_LOCALE") || "en";
        config.headers["Accept-Language"] = lang;
        config.headers["x-lang"] = lang;
    }
    return config;
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
