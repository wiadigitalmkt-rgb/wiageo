import { createClient } from '@supabase/supabase-js';

// Client com a Service Role Key: roda no servidor (Vercel Function), nunca no browser.
// Ignora RLS de propósito — cada função abaixo filtra manualmente por empresa_id
// depois de identificar a empresa do usuário autenticado.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Extrai e valida o usuário logado a partir do header Authorization: Bearer <token>
// enviado pelo compat client (src/api/apiClient.js -> functions.invoke).
// Retorna { user, profile, empresa } ou lança um erro com .status para a function tratar.
export async function requireUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*, empresas(*)')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.empresa_id) {
    const err = new Error('Usuário não vinculado a uma empresa');
    err.status = 403;
    throw err;
  }

  return { user, profile, empresa: profile.empresas };
}

// Wrapper padrão para as functions: trata erros, seta status/JSON de forma consistente.
export function withHandler(handler) {
  return async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    try {
      const ctx = await requireUser(req);
      const result = await handler(req, ctx);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message || 'Internal error' });
    }
  };
}
