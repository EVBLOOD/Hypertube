import { ApiErrorResponse } from "@/types/app";
import { AxiosError } from "axios";

const RESOLUTION_MAP = {
    "4320p": "8K Ultra HD",
    "2160p": "4K Ultra HD",
    "1440p": "Quad HD",
    "1080p": "Full HD",
    "720p": "HD",
    "480p": "SD",
} as const;

type ResolutionKey = keyof typeof RESOLUTION_MAP;

export function getResolutionLabel(vertical: string): string | undefined {
    return RESOLUTION_MAP[vertical as ResolutionKey];
}

export function getErrorMessage(error: unknown, error1?: unknown): string {
    const realError = error1 || error;

    return (
        ((msg) => (Array.isArray(msg) ? msg[0] : msg))(
            ((realError as AxiosError).response?.data as ApiErrorResponse)
                ?.message,
        ) || "An listed error occurred."
    );
}
