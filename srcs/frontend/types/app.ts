import type { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

export type SupportedLanguage = "en" | "fr" | "ar";
export type PrivacyMode = "public" | "private";

export interface Login {
    username: string;
    password: string;
}

export interface Register {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface MovieType {
    id: string;
    title: string;
    year: number;
    rating: number;
    genres: string[];
    quality: string;
    standard_audio_format: string;
    poster: string;
    isWatched: boolean;
    isWishlisted: boolean;
    totalMinutes: number;
    lastWatchedTime: number;
    liked: boolean;
    disliked: boolean;
}

export interface CommentUser {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
}

export interface CommentType {
    id: number;
    content: string;
    createdAt: string;
    userReaction: number;
    likeCount: number;
    dislikeCount: number;
    user?: CommentUser;
}

export interface UserSearchType {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

export interface TrendingMovie {
    id: number;
    title: string;
    poster: string;
    quality: string;
    standard_audio_format: string;
    overview?: string;
    rating?: number;
    time?: number;
}

export interface MovieInfos {
    id: string;
    title: string;
    year: number;
    rating: number;
    genres: string[];
    quality: string;
    standard_audio_format: string;
    poster: string;
    isWatched: boolean;
    overview?: string;
    description?: string;
    size?: string;
    time?: number;
}

export interface WatchPartyMovie {
    title: string;
    description: string;
    poster: string;
}

export interface WatchPartySubtitle {
    lang: string;
    language: string;
    urlLink: string;
}

export interface Message {
    content: string;
    sender: string;
}

export interface WatchPartyProps {
    movieId: string;
    roomToken: string | null;
    movie: WatchPartyMovie;
    qualities?: string[];
    subtitles?: WatchPartySubtitle[];
    handlePlayMovie?: () => void;
    handlePauseMovie?: () => void;
    heartbeatInterval: Dispatch<SetStateAction<number>>;
    initialTime?: number;
}

export interface ApiParameter {
    name: string;
    in: "body" | "query" | "param" | "header" | "unknown";
    type: string | [field: string, type: string][];
    required?: boolean;
}

export interface LocalizedText {
    en: string;
    fr: string;
    ar: string;
}

export interface ApiCardProps {
    title: string;
    description: string;
    method: string;
    path: string;
    access: "public" | "private";
    permission?: string;
    parameters?: ApiParameter[];
    response?: string;
}

export type DocParamType = string | [field: string, type: string][];

export interface DocParams {
    name: string;
    in: "body" | "query" | "param" | "header" | "unknown";
    type?: DocParamType;
    required: boolean;
}

export interface Docs {
    method: string;
    path: string;
    target?: string;
    summary?: LocalizedText;
    description?: LocalizedText;
    params?: DocParams[];
}

export type ApiDocumentation = Record<string, Docs[]>;

export interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

export interface MovieFilters {
    genre: string;
    minYear: number;
    maxYear: number;
    minRating: number;
    sortBy: string;
    query: string;
    order: string;
}

export interface UserSessionProfile {
    username: string;
    language: SupportedLanguage;
    avatar: string;
    isPublic: boolean;
}

export interface UserStoreState {
    user: UserSessionProfile | undefined;
    userLogged: (user: UserSessionProfile) => void;
    userAvatarUpdate: (avatar: string) => void;
    userLanguageUpdate: (language: SupportedLanguage) => void;
    reset: () => void;
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    profilePicture?: string | null;
    preferredLanguage?: SupportedLanguage;
    privacy?: PrivacyMode;
}

export interface ProfileSummaryUser {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    preferredLanguage: SupportedLanguage;
    privacy: PrivacyMode;
    profilePicture: string;
}

export interface ProfileSummaryStats {
    watched: number;
    wishlisted: number;
    liked: number;
    disliked: number;
    totalInteractions: number;
}

export interface ProfileHistoryItem {
    title: string;
    overview: string;
    quality: string;
    action: string;
    actionDate: string | Date;
    poster: string;
}

export interface ProfileSummary {
    user: ProfileSummaryUser;
    stats?: ProfileSummaryStats;
    history?: {
        data?: ProfileHistoryItem[];
    };
}

export interface ProfileUpdateResponse {
    user?: ProfileSummaryUser;
    actions?: string[];
}

export interface AvatarUpdateResponse {
    filename: string;
}

export interface ApiErrorResponse {
    message: string | string[];
}
