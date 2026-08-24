// auth
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

// Library
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
}

export interface CommentType {
    id: number;
    content: string;
    createdAt: string;
    userReaction: number;
    likeCount: number;
    dislikeCount: number;
    user?: {
        id: number;
        username?: string;
        firstName?: string;
        lastName?: string;
    };
}

// User Search
export interface UserSearchType {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}
