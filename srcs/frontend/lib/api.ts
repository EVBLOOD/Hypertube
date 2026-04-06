import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/',
    headers: {
        'Content-Type': 'application/json'
    }
})

export const ServerCall = async () => {
    const token = (await cookies()).get('token')?.value

    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return api
}

api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) redirect('/login');
    return Promise.reject(error);
})

export default api;