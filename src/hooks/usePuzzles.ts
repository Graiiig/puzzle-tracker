import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Puzzle } from '../types';

const COLUMNS = 'id, name, brand, genres, pieces, status, rating, difficulty, date, time, notes';

export function usePuzzles(userId: string | null) {
  const [collection, setCollection] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCollection([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('puzzles')
      .select(COLUMNS)
      .order('created_at', { ascending: false });
    if (!error && data) setCollection(data as unknown as Puzzle[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addPuzzle(item: Puzzle): Promise<boolean> {
    if (!userId) return false;
    const { error } = await supabase.from('puzzles').insert({ ...item, user_id: userId });
    if (error) return false;
    setCollection((c) => [item, ...c]);
    return true;
  }

  async function updatePuzzle(id: string, patch: Omit<Puzzle, 'id'>): Promise<boolean> {
    const { error } = await supabase.from('puzzles').update(patch).eq('id', id);
    if (error) return false;
    setCollection((c) => c.map((p) => (p.id === id ? { id, ...patch } : p)));
    return true;
  }

  async function deletePuzzle(id: string): Promise<void> {
    setCollection((c) => c.filter((p) => p.id !== id));
    await supabase.from('puzzles').delete().eq('id', id);
  }

  return { collection, loading, addPuzzle, updatePuzzle, deletePuzzle, refresh };
}
