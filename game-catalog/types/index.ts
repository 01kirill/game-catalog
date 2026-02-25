export interface Studio {
    id: number;
    name: string;
    description: string;
    rating: number;
}

export interface Game {
    id: number;
    title: string;
    genre: string;
    releaseYear: number;
    rating: number;
    studioId: number;
}
