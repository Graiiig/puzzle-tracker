export type Genre = string;
export type Status = 'À faire' | 'En cours' | 'Terminé';
export type Priority = 'Basse' | 'Moyenne' | 'Haute';
export type SortMode = 'Récent' | 'Alphabétique' | 'Pièces' | 'Difficulté';

export interface Puzzle {
  id: string;
  name: string;
  brand: string;
  genre: Genre;
  pieces: number;
  status: Status;
  rating: number;
  difficulty: number;
  date: string;
  time: string;
  notes: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  genre: Genre;
  pieces: number;
  priority: Priority;
  notes: string;
}

export interface PuzzleForm {
  name: string;
  brand: string;
  genre: Genre;
  pieces: string;
  status: Status;
  priority: Priority;
  notes: string;
  rating: number;
  difficulty: number;
  date: string;
  time: string;
}

export type Screen = 'home' | 'wishlist' | 'detail' | 'add';
export type DetailSource = 'collection' | 'wishlist';
