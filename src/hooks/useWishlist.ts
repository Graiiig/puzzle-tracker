import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { WishlistItem } from '../types';
import { withRetry } from '../utils/retry';

const COLUMNS = 'id, user_id, name, brand, artist, genres, pieces, priority, notes';

function mapRow(row: Record<string, unknown>): WishlistItem {
  const { user_id, ...rest } = row;
  return { ...rest, ownerId: user_id } as WishlistItem;
}

export function useWishlist(userId: string | null) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setWishlist([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await withRetry(() =>
      supabase.from('wishlist_items').select(COLUMNS).order('created_at', { ascending: false }),
    );
    if (!error && data) setWishlist((data as Record<string, unknown>[]).map(mapRow));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addWishlistItem(item: Omit<WishlistItem, 'ownerId'>): Promise<boolean> {
    if (!userId) return false;
    const { error } = await supabase.from('wishlist_items').insert({ ...item, user_id: userId });
    if (error) return false;
    setWishlist((w) => [{ ...item, ownerId: userId }, ...w]);
    return true;
  }

  async function updateWishlistItem(id: string, patch: Omit<WishlistItem, 'id' | 'ownerId'>): Promise<boolean> {
    const { error } = await supabase.from('wishlist_items').update(patch).eq('id', id);
    if (error) return false;
    setWishlist((w) => w.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    return true;
  }

  async function deleteWishlistItem(id: string): Promise<void> {
    setWishlist((w) => w.filter((x) => x.id !== id));
    await supabase.from('wishlist_items').delete().eq('id', id);
  }

  return { wishlist, loading, addWishlistItem, updateWishlistItem, deleteWishlistItem, refresh };
}
