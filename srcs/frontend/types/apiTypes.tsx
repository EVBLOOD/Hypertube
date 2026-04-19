
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


export interface MovieType {
    id: string,
    title: string,
    year: number,
    rating: number,
    genres: string[],
    quality: string, //1080P
    standard_audio_format: string, // '5.1 SURROUND'
    poster: string
    isWatched: boolean,
}