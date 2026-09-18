import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ShareInvite, SharedOwner } from '../types';

interface ShareOptions {
  shareCollection: boolean;
  shareWishlist: boolean;
}

export function useShares(userId: string | null) {
  const [pseudo, setPseudoState] = useState('');
  const [myShares, setMyShares] = useState<ShareInvite[]>([]);
  const [sharedCollectionOwners, setSharedCollectionOwners] = useState<SharedOwner[]>([]);
  const [sharedWishlistOwners, setSharedWishlistOwners] = useState<SharedOwner[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPseudoState('');
      setMyShares([]);
      setSharedCollectionOwners([]);
      setSharedWishlistOwners([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: profile }, { data: outgoing }, { data: incoming }] = await Promise.all([
      supabase.from('profiles').select('pseudo').eq('user_id', userId).maybeSingle(),
      supabase
        .from('collection_shares')
        .select('id, invited_email, share_collection, share_wishlist')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('collection_shares')
        .select('owner_id, share_collection, share_wishlist')
        .neq('owner_id', userId),
    ]);

    setPseudoState((profile as { pseudo: string } | null)?.pseudo ?? '');
    setMyShares(
      ((outgoing ?? []) as { id: string; invited_email: string; share_collection: boolean; share_wishlist: boolean }[]).map(
        (r) => ({
          id: r.id,
          invitedEmail: r.invited_email,
          shareCollection: r.share_collection,
          shareWishlist: r.share_wishlist,
        }),
      ),
    );

    const incomingRows = (incoming ?? []) as { owner_id: string; share_collection: boolean; share_wishlist: boolean }[];
    const collectionOwnerIds = [...new Set(incomingRows.filter((r) => r.share_collection).map((r) => r.owner_id))];
    const wishlistOwnerIds = [...new Set(incomingRows.filter((r) => r.share_wishlist).map((r) => r.owner_id))];
    const allOwnerIds = [...new Set([...collectionOwnerIds, ...wishlistOwnerIds])];

    if (allOwnerIds.length === 0) {
      setSharedCollectionOwners([]);
      setSharedWishlistOwners([]);
    } else {
      const { data: owners } = await supabase.from('profiles').select('user_id, pseudo').in('user_id', allOwnerIds);
      const pseudoOf = new Map(
        ((owners ?? []) as { user_id: string; pseudo: string }[]).map((o) => [o.user_id, o.pseudo]),
      );
      setSharedCollectionOwners(collectionOwnerIds.map((id) => ({ userId: id, pseudo: pseudoOf.get(id) ?? '' })));
      setSharedWishlistOwners(wishlistOwnerIds.map((id) => ({ userId: id, pseudo: pseudoOf.get(id) ?? '' })));
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function savePseudo(value: string): Promise<boolean> {
    if (!userId) return false;
    const trimmed = value.trim();
    const { error } = await supabase.from('profiles').update({ pseudo: trimmed }).eq('user_id', userId);
    if (error) return false;
    setPseudoState(trimmed);
    return true;
  }

  async function addShare(email: string, options: ShareOptions): Promise<boolean> {
    if (!userId) return false;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return false;
    const { data, error } = await supabase
      .from('collection_shares')
      .insert({
        owner_id: userId,
        invited_email: trimmed,
        share_collection: options.shareCollection,
        share_wishlist: options.shareWishlist,
      })
      .select('id, invited_email, share_collection, share_wishlist')
      .single();
    if (error || !data) return false;
    setMyShares((s) => [
      {
        id: data.id,
        invitedEmail: data.invited_email,
        shareCollection: data.share_collection,
        shareWishlist: data.share_wishlist,
      },
      ...s,
    ]);
    return true;
  }

  async function updateShare(id: string, patch: Partial<ShareOptions>): Promise<boolean> {
    const dbPatch: Record<string, boolean> = {};
    if (patch.shareCollection !== undefined) dbPatch.share_collection = patch.shareCollection;
    if (patch.shareWishlist !== undefined) dbPatch.share_wishlist = patch.shareWishlist;
    const { error } = await supabase.from('collection_shares').update(dbPatch).eq('id', id);
    if (error) return false;
    setMyShares((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    return true;
  }

  async function removeShare(id: string): Promise<void> {
    setMyShares((s) => s.filter((x) => x.id !== id));
    await supabase.from('collection_shares').delete().eq('id', id);
  }

  return {
    pseudo,
    savePseudo,
    myShares,
    addShare,
    updateShare,
    removeShare,
    sharedCollectionOwners,
    sharedWishlistOwners,
    loading,
    refresh,
  };
}
