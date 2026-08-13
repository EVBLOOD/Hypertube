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
