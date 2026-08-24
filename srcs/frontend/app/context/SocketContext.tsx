"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const getCookie = (name: string) => {
        const parts = `; ${document.cookie}`.split(`; ${name}=`);
        if (parts && parts.length === 2) return parts.pop()?.split(";").shift();
    };

    useEffect(() => {
        const token = getCookie("AUTH_TOKEN");
        console.log("AUTH_TOKEN:", token);

        if (!token) return;

        const socketInstance = io(
            `${process.env.NEXT_PUBLIC_SOCKET_URL}/movie`,
            {
                path: "/api/socket.io",
                extraHeaders: {
                    authorization: `Bearer ${token}`,
                },
            },
        );

        socketInstance.on("connect", () => setIsConnected(true));
        socketInstance.on("disconnect", () => setIsConnected(false));

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
