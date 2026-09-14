import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import { integrations } from '@/api/storage';
import { supabase } from '@/lib/supabaseClient';

// Ponto único de acesso a dados/autenticação/arquivos usado por todas as telas
// ( .auth / .entities / .integrations / .functions ), assim as ~20 telas do app
// não precisam saber o que roda por baixo.
//
// Por baixo, tudo fala com Supabase (Postgres + Auth + Storage) e com as
// Vercel Functions em /api para as rotinas de servidor (viabilidade, MK-AUTH, etc).
export const api = {
  auth,
  entities,
  integrations,

  // Substitui api.functions.invoke("nome", payload) -> chama /api/nome na Vercel,
  // enviando o token de sessão do Supabase para a function validar o usuário.
  functions: {
    async invoke(name, payload = {}) {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/${name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Falha ao chamar função ${name}`);
      return json;
    },
  },
};
