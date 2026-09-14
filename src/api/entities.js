import { supabase } from '@/lib/supabaseClient';

// Nome lógico da entidade (PascalCase, ex: api.entities.Cto)
// -> nome da tabela real no Postgres.
const TABLE_MAP = {
  Bairro: 'bairros',
  Cabo: 'cabos',
  Ceo: 'ceos',
  ClienteFibra: 'clientes_fibra',
  Cobertura: 'coberturas',
  Condominio: 'condominios',
  ElementoRede: 'elementos_rede',
  Olt: 'olts',
  Pasta: 'pastas',
  Pop: 'pops',
  Cto: 'ctos',
};

let _empresaIdCache = null;
async function getEmpresaId() {
  if (_empresaIdCache) return _empresaIdCache;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  const { data, error } = await supabase
    .from('profiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single();
  if (error) throw error;
  if (!data?.empresa_id) throw new Error('Usuário ainda não está vinculado a uma empresa');
  _empresaIdCache = data.empresa_id;
  return _empresaIdCache;
}
// Chame isso no logout para não vazar empresa_id de um usuário para outro na mesma aba.
export function clearEmpresaIdCache() {
  _empresaIdCache = null;
}

function throwIfError(error) {
  if (error) throw new Error(error.message || String(error));
}

// Converte "-created_date" (convenção api de sort) em { column, ascending }
function parseSort(sort) {
  if (!sort) return null;
  const ascending = !sort.startsWith('-');
  const column = ascending ? sort : sort.slice(1);
  // api usava "created_date"; nossa coluna equivalente é created_at
  return { column: column === 'created_date' ? 'created_at' : column, ascending };
}

function makeEntityClient(table) {
  return {
    // list(sort?) — lista tudo (RLS já restringe à empresa do usuário logado)
    async list(sort) {
      let q = supabase.from(table).select('*');
      const s = parseSort(sort);
      q = s ? q.order(s.column, { ascending: s.ascending }) : q.order('created_at', { ascending: false });
      const { data, error } = await q;
      throwIfError(error);
      return data;
    },

    // filter({ campo: valor, ... }, sort?, limit?) — equivalente a api .filter()
    async filter(query = {}, sort, limit) {
      let q = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(query)) {
        q = Array.isArray(value) ? q.in(key, value) : q.eq(key, value);
      }
      const s = parseSort(sort);
      if (s) q = q.order(s.column, { ascending: s.ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      throwIfError(error);
      return data;
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      throwIfError(error);
      return data;
    },

    async create(payload) {
      const empresa_id = await getEmpresaId();
      const { data, error } = await supabase
        .from(table)
        .insert({ ...payload, empresa_id })
        .select()
        .single();
      throwIfError(error);
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      throwIfError(error);
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      throwIfError(error);
      return { success: true };
    },
  };
}

export const entities = Object.fromEntries(
  Object.entries(TABLE_MAP).map(([name, table]) => [name, makeEntityClient(table)])
);
