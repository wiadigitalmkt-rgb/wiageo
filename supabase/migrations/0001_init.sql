-- ============================================================================
-- WIAGEO — Schema inicial Supabase (Postgres)
-- Migrado das entidades Base44. Multi-tenant via coluna empresa_id + RLS.
-- Rode este arquivo inteiro no SQL Editor do Supabase (ou via `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TENANTS (empresas/provedores clientes do SaaS)
-- ----------------------------------------------------------------------------
create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  mkauth_url text,               -- URL base do MK-AUTH deste provedor
  plano text not null default 'trial' check (plano in ('trial','starter','pro','enterprise')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. PERFIS (estende auth.users do Supabase)
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid references empresas(id) on delete set null,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('super_admin','admin','user')),
  created_at timestamptz not null default now()
);

-- Helper: empresa do usuário logado (usado em todas as policies)
create or replace function auth_empresa_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select empresa_id from profiles where id = auth.uid()
$$;

create or replace function auth_role()
returns text
language sql stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid()
$$;

-- Cria o profile automaticamente quando um usuário se cadastra no Supabase Auth
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. TABELAS DE DOMÍNIO (mapeadas das entidades Base44)
-- ----------------------------------------------------------------------------

create table if not exists pastas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  parent_id uuid references pastas(id) on delete cascade,
  tipo_item text not null default 'cto' check (tipo_item in ('cto','ceo','cabo','pop','olt')),
  created_at timestamptz not null default now()
);

create table if not exists bairros (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  cidade text not null,
  created_at timestamptz not null default now()
);

create table if not exists condominios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  bairro_id uuid references bairros(id) on delete set null,
  cidade text not null,
  created_at timestamptz not null default now()
);

create table if not exists olts (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  ip text not null,
  modelo text,
  created_at timestamptz not null default now()
);

create table if not exists pops (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  endereco text,
  cep text,
  cidade text not null,
  latitude double precision,
  longitude double precision,
  descricao text,
  tipo text not null default 'principal' check (tipo in ('principal','secundario','edge')),
  pasta_id uuid references pastas(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists ceos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  codigo text not null,
  nome text,
  descricao text,
  endereco text,
  cep text,
  bairro_id uuid references bairros(id) on delete set null,
  condominio_id uuid references condominios(id) on delete set null,
  cidade text not null,
  latitude double precision,
  longitude double precision,
  tipo text not null default 'emenda' check (tipo in ('emenda','distribuicao','transicao')),
  capacidade_fibras integer,
  splitter text not null default '1x8' check (splitter in ('1x2','1x4','1x8','1x16','1x32','1x64')),
  secundarios jsonb not null default '[]',   -- [{porta, endereco, potencia}]
  fotos text[] not null default '{}',
  pasta_id uuid references pastas(id) on delete set null,
  data_ultima_atualizacao timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ctos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  codigo text not null,
  descricao text,
  endereco text,
  cep text,
  cidade text not null,
  bairro_id uuid references bairros(id) on delete set null,
  condominio_id uuid references condominios(id) on delete set null,
  latitude double precision not null,
  longitude double precision not null,
  splitter text not null default '1x8' check (splitter in ('1x2','1x4','1x8','1x16','1x32','1x64')),
  potencia double precision,
  status text not null default 'ativo' check (status in ('ativo','manutencao','rompido')),
  id_olt uuid references olts(id) on delete set null,
  fotos text[] not null default '{}',
  pasta_id uuid references pastas(id) on delete set null,
  data_ultima_atualizacao timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_ctos_empresa on ctos(empresa_id);
create index if not exists idx_ctos_geo on ctos(latitude, longitude);

create table if not exists cabos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  codigo text not null,
  bairro_id uuid references bairros(id) on delete set null,
  condominio_id uuid references condominios(id) on delete set null,
  cidade text not null,
  tipo text not null default 'at' check (tipo in ('at','ressal','drop','indoor')),
  quantidade_fibras integer not null,
  metragem double precision,
  origem text,
  destino text,
  pasta_id uuid references pastas(id) on delete set null,
  coordenadas jsonb not null default '[]',  -- [{lat, lng}]
  created_at timestamptz not null default now()
);

create table if not exists elementos_rede (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  tipo text not null default 'emenda_fusao' check (tipo in ('emenda_fusao','pigtail','acoplador','splitter','acessorio','outro')),
  bairro_id uuid references bairros(id) on delete set null,
  condominio_id uuid references condominios(id) on delete set null,
  cidade text not null,
  descricao text,
  created_at timestamptz not null default now()
);

create table if not exists clientes_fibra (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  endereco text,
  pppoe text,
  mac text,
  serial text,
  porta_conectada integer not null,
  id_cto uuid not null references ctos(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists idx_clientes_cto on clientes_fibra(id_cto);
create index if not exists idx_clientes_pppoe on clientes_fibra(pppoe);

create table if not exists coberturas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  cidade text not null,
  poligono jsonb not null default '[]',  -- [{lat, lng}]
  cor text not null default '#00C7D9',
  opacidade double precision not null default 0.3,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. RLS — isolamento por empresa_id (multi-tenant)
-- ----------------------------------------------------------------------------
alter table empresas enable row level security;
alter table profiles enable row level security;
alter table pastas enable row level security;
alter table bairros enable row level security;
alter table condominios enable row level security;
alter table olts enable row level security;
alter table pops enable row level security;
alter table ceos enable row level security;
alter table ctos enable row level security;
alter table cabos enable row level security;
alter table elementos_rede enable row level security;
alter table clientes_fibra enable row level security;
alter table coberturas enable row level security;

-- profiles: cada usuário vê/edita o próprio perfil; admin da empresa vê os da empresa
create policy "profiles_select_own_or_same_empresa" on profiles
  for select using (id = auth.uid() or empresa_id = auth_empresa_id());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- empresas: usuário vê apenas a própria empresa
create policy "empresas_select_own" on empresas
  for select using (id = auth_empresa_id());
create policy "empresas_update_admin" on empresas
  for update using (id = auth_empresa_id() and auth_role() in ('admin','super_admin'));

-- Política genérica reaplicada em cada tabela de domínio:
-- SELECT/INSERT/UPDATE/DELETE somente dentro da própria empresa_id.
do $$
declare
  t text;
begin
  foreach t in array array['pastas','bairros','condominios','olts','pops','ceos','ctos','cabos','elementos_rede','clientes_fibra','coberturas']
  loop
    execute format('create policy "%1$s_tenant_select" on %1$s for select using (empresa_id = auth_empresa_id());', t);
    execute format('create policy "%1$s_tenant_insert" on %1$s for insert with check (empresa_id = auth_empresa_id());', t);
    execute format('create policy "%1$s_tenant_update" on %1$s for update using (empresa_id = auth_empresa_id());', t);
    execute format('create policy "%1$s_tenant_delete" on %1$s for delete using (empresa_id = auth_empresa_id() and auth_role() in (''admin'',''super_admin''));', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 5. STORAGE — bucket para fotos de CTO/CEO
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('wiageo-fotos', 'wiageo-fotos', true)
on conflict (id) do nothing;

create policy "wiageo_fotos_read_public" on storage.objects
  for select using (bucket_id = 'wiageo-fotos');
create policy "wiageo_fotos_insert_auth" on storage.objects
  for insert with check (bucket_id = 'wiageo-fotos' and auth.role() = 'authenticated');
create policy "wiageo_fotos_delete_auth" on storage.objects
  for delete using (bucket_id = 'wiageo-fotos' and auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 6. Seed opcional: crie sua primeira empresa e vincule seu usuário a ela
-- (rode manualmente, após criar seu usuário via tela de Registro)
-- ----------------------------------------------------------------------------
-- insert into empresas (nome, slug) values ('Wianet Telecom', 'wianet') returning id;
-- update profiles set empresa_id = '<uuid-da-empresa>', role = 'admin' where email = 'seu@email.com';
