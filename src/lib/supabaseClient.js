import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Falha alto e cedo — evita erros confusos de "fetch failed" mais tarde.
  console.error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. ' +
    'Copie .env.example para .env.local e preencha com os dados do seu projeto Supabase.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
