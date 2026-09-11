export type Genre = string;
export type Status = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type SortMode = 'recent' | 'alphabetical' | 'pieces' | 'difficulty';
export type PieceBucket = 'lt500' | '500-999' | '1000-1999' | 'gte2000';

export interface Puzzle {
  id: string;
  name: string;
  brand: string;
  genres: Genre[];
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
  genres: Genre[];
  pieces: number;
  priority: Priority;
  notes: string;
}

export interface PuzzleForm {
  name: string;
  brand: string;
  genres: Genre[];
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
