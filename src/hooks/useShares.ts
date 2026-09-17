import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ShareInvite, SharedOwner } from '../types';

export function useShares(userId: string | null) {
  const [pseudo, setPseudoState] = useState('');
  const [myShares, setMyShares] = useState<ShareInvite[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedOwner[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPseudoState('');
      setMyShares([]);
      setSharedWithMe([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: profile }, { data: outgoing }, { data: incoming }] = await Promise.all([
      supabase.from('profiles').select('pseudo').eq('user_id', userId).maybeSingle(),
      supabase
        .from('collection_shares')
        .select('id, invited_email')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
      supabase.from('collection_shares').select('owner_id').neq('owner_id', userId),
    ]);

    setPseudoState((profile as { pseudo: string } | null)?.pseudo ?? '');
    setMyShares(
      ((outgoing ?? []) as { id: string; invited_email: string }[]).map((r) => ({
        id: r.id,
        invitedEmail: r.invited_email,
      })),
    );

    const ownerIds = [...new Set(((incoming ?? []) as { owner_id: string }[]).map((r) => r.owner_id))];
    if (ownerIds.length === 0) {
      setSharedWithMe([]);
    } else {
      const { data: owners } = await supabase.from('profiles').select('user_id, pseudo').in('user_id', ownerIds);
      setSharedWithMe(
        ((owners ?? []) as { user_id: string; pseudo: string }[]).map((o) => ({
          userId: o.user_id,
          pseudo: o.pseudo,
        })),
      );
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

  async function addShare(email: string): Promise<boolean> {
    if (!userId) return false;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return false;
    const { data, error } = await supabase
      .from('collection_shares')
      .insert({ owner_id: userId, invited_email: trimmed })
      .select('id, invited_email')
      .single();
    if (error || !data) return false;
    setMyShares((s) => [{ id: data.id, invitedEmail: data.invited_email }, ...s]);
    return true;
  }

  async function removeShare(id: string): Promise<void> {
    setMyShares((s) => s.filter((x) => x.id !== id));
    await supabase.from('collection_shares').delete().eq('id', id);
  }

  return { pseudo, savePseudo, myShares, addShare, removeShare, sharedWithMe, loading, refresh };
}
