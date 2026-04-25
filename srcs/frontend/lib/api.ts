import axios from "axios";
import { redirect } from "next/navigation";

const api = axios.create({
    baseURL: process.env.PUBLIC_API_URL || 'http://192.168.1.5:8081/api/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) redirect('/login');
    return Promise.reject(error);
})

export default api;