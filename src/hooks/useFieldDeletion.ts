import { supabase } from '../lib/supabaseClient';

export function useFieldDeletion() {
  async function clearBrand(brand: string): Promise<boolean> {
    const { error } = await supabase.rpc('clear_brand_everywhere', { p_brand: brand });
    return !error;
  }

  async function clearArtist(artist: string): Promise<boolean> {
    const { error } = await supabase.rpc('clear_artist_everywhere', { p_artist: artist });
    return !error;
  }

  return { clearBrand, clearArtist };
}
