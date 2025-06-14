'use server';
import { supabase } from '../lib/supabaseClient';
export async function getTokens() {
  const { data, error } = await supabase
    .from('created_tokens')
    .select('*')
    .order('created_at', { ascending: false });

  return data;
}
