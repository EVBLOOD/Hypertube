
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
    id: string,
    title: string,
    year: number,
    rating: number,
    genres: string[],
    quality: string,
    standard_audio_format: string,
    poster: string
    isWatched: boolean,
}