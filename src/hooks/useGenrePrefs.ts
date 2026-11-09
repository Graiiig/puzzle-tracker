import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useGenrePrefs(userId: string | null) {
  const [removedGenres, setRemovedGenres] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!userId) {
      setRemovedGenres(new Set());
      return;
    }
    const { data, error } = await supabase.from('profiles').select('removed_genres').eq('user_id', userId).maybeSingle();
    if (!error && data) setRemovedGenres(new Set(data.removed_genres ?? []));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function removeGenre(genre: string): Promise<boolean> {
    const { error } = await supabase.rpc('remove_genre_everywhere', { p_genre: genre });
    if (error) return false;
    setRemovedGenres((prev) => new Set(prev).add(genre));
    return true;
  }

  return { removedGenres, removeGenre };
}
