export interface Origin {
    name: string;
    url: string;
  }

export interface Location {
  name: string;
  url: string;
}
  
  export interface Character {
    id: number;
    name: string;
    status: string;
    species: string;
    gender: string;
    image: string;
    origin: Origin;
    location: Location;
    episode: string[];
  }
  
