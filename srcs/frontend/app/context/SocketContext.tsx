"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useSyncExternalStore,
} from "react";
import { io, Socket } from "socket.io-client";
import type { SocketContextType } from "@/types/app";

let socketInstance: Socket | null = null;
let currentSnapshot: SocketContextType = { socket: null, isConnected: false };
const listeners = new Set<() => void>();

const SERVER_SNAPSHOT: SocketContextType = Object.freeze({
    socket: null,
    isConnected: false,
});

function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function getSnapshot(): SocketContextType {
    return currentSnapshot;
}

function updateSnapshot() {
    const isConnected = socketInstance?.connected ?? false;

    if (
        currentSnapshot.socket !== socketInstance ||
        currentSnapshot.isConnected !== isConnected
    ) {
        currentSnapshot = { socket: socketInstance, isConnected };
    }
    listeners.forEach((listener) => listener());
}

const getCookie = (name: string) => {
    if (typeof document === "undefined") return undefined;
    const parts = `; ${document.cookie}`.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        const token = getCookie("AUTH_TOKEN");
        if (!token) return;

        socketInstance = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/movie`, {
            path: "/api/socket.io",
            extraHeaders: { authorization: `Bearer ${token}` },
        });

        socketInstance.on("connect", updateSnapshot);
        socketInstance.on("disconnect", updateSnapshot);
        updateSnapshot();

        return () => {
            if (socketInstance) {
                socketInstance.off("connect", updateSnapshot);
                socketInstance.off("disconnect", updateSnapshot);
                socketInstance.disconnect();
                socketInstance = null;
                updateSnapshot();
            }
        };
    }, []);

    const contextValue = useSyncExternalStore(
        subscribe,
        getSnapshot,
        () => SERVER_SNAPSHOT,
    );

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
