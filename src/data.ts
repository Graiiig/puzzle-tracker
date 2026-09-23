import type { Genre, Priority, PuzzleForm, SortMode, Status } from './types';

export const DEFAULT_GENRES: Genre[] = ['Paysage', 'Animaux', 'Art', 'Fantaisie', 'Ville'];
export const SORT_MODES: SortMode[] = ['recent', 'alphabetical', 'pieces', 'difficulty'];
export const STATUSES: Status[] = ['todo', 'in_progress', 'done'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export const FREE_COLLECTION_LIMIT = 30;
export const FREE_WISHLIST_LIMIT = 15;

export const EMPTY_FORM: PuzzleForm = {
  name: '',
  brand: '',
  artist: '',
  genres: [],
  pieces: '',
  status: 'todo',
  priority: 'medium',
  notes: '',
  rating: 0,
  difficulty: 3,
  date: '',
  time: '',
};
