import type { Genre, Priority, PuzzleForm, SortMode, Status } from './types';

export const DEFAULT_GENRES: Genre[] = ['Paysage', 'Animaux', 'Art', 'Fantaisie', 'Ville'];
export const SORT_MODES: SortMode[] = ['Récent', 'Alphabétique', 'Pièces', 'Difficulté'];
export const STATUSES: Status[] = ['À faire', 'En cours', 'Terminé'];
export const PRIORITIES: Priority[] = ['Basse', 'Moyenne', 'Haute'];

export const EMPTY_FORM: PuzzleForm = {
  name: '',
  brand: '',
  genres: [],
  pieces: '',
  status: 'À faire',
  priority: 'Moyenne',
  notes: '',
  rating: 0,
  difficulty: 3,
  date: '',
  time: '',
};
