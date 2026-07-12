import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { WishlistItem } from '../types';

const COLUMNS = 'id, name, brand, genres, pieces, priority, notes';

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
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(COLUMNS)
      .order('created_at', { ascending: false });
    if (!error && data) setWishlist(data as unknown as WishlistItem[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addWishlistItem(item: WishlistItem): Promise<boolean> {
    if (!userId) return false;
    const { error } = await supabase.from('wishlist_items').insert({ ...item, user_id: userId });
    if (error) return false;
    setWishlist((w) => [item, ...w]);
    return true;
  }

  async function updateWishlistItem(id: string, patch: Omit<WishlistItem, 'id'>): Promise<boolean> {
    const { error } = await supabase.from('wishlist_items').update(patch).eq('id', id);
    if (error) return false;
    setWishlist((w) => w.map((x) => (x.id === id ? { id, ...patch } : x)));
    return true;
  }

  async function deleteWishlistItem(id: string): Promise<void> {
    setWishlist((w) => w.filter((x) => x.id !== id));
    await supabase.from('wishlist_items').delete().eq('id', id);
  }

  return { wishlist, loading, addWishlistItem, updateWishlistItem, deleteWishlistItem, refresh };
}
