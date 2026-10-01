import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Championship } from '../types';
import { withRetry } from '../utils/retry';

const COLUMNS = 'id, title, start_date, end_date, location, stream_url, info_url, is_live';

function mapRow(row: Record<string, unknown>): Championship {
  return {
    id: row.id as string,
    title: row.title as string,
    startDate: row.start_date as string,
    endDate: (row.end_date as string | null) ?? null,
    location: row.location as string,
    streamUrl: (row.stream_url as string | null) ?? null,
    infoUrl: (row.info_url as string | null) ?? null,
    isLive: row.is_live as boolean,
  };
}

export function useChampionships(userId: string | null) {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setChampionships([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await withRetry(() =>
      supabase.from('championships').select(COLUMNS).order('start_date', { ascending: true }),
    );
    if (!error && data) setChampionships((data as Record<string, unknown>[]).map(mapRow));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { championships, loading, refresh };
}
