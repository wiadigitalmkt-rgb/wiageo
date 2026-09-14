# WIAGEO — Guia de Migração Base44 → Supabase + Vercel

Este pacote já vem com o código migrado. Este guia mostra **exatamente** onde
colar cada coisa, na ordem certa.

## O que mudou (visão geral)

| Antes (Base44) | Depois |
|---|---|
| Banco/entidades do Base44 | Postgres no **Supabase**, schema em `supabase/migrations/0001_init.sql` |
| Auth do Base44 | **Supabase Auth** (email/senha, Google, OTP, reset de senha) |
| `api.entities.X` no frontend | `src/api/entities.js` fala direto com Supabase (RLS protege os dados) |
| Upload de fotos (`api.integrations.Core.UploadFile`) | Supabase Storage, bucket `wiageo-fotos` |
| 7 Functions do Base44 (`base44/functions/*`) | 7 **Vercel Functions** em `/api/*.js`, mesma lógica |
| Deploy via Base44 | **GitHub → Vercel** (deploy automático a cada push) |

**A parte mais importante:** eu criei uma "camada de compatibilidade"
(`src/api/apiClient.js`, `src/api/auth.js`, `src/api/entities.js`,
`src/api/storage.js`) que expõe uma API única (`api.auth`, `api.entities`, etc)
(`api.auth.me()`, `api.entities.Cto.list()`, etc). Resultado: as ~20
telas e componentes que você já tinha (Dashboard, Login, PortManager,
FolderSection...) **não precisaram ser reescritas** — só trocaram o que tem
por baixo do capô. Você não vai precisar editar essas telas para migrar.

---

## Passo 1 — Criar o projeto no Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e clique em **New Project**.
2. Anote a **senha do banco** que você definir.
3. Quando o projeto terminar de provisionar, vá em **Project Settings → API** e copie:
   - `Project URL` → vai virar `VITE_SUPABASE_URL` e `SUPABASE_URL`
   - `anon public key` → vai virar `VITE_SUPABASE_ANON_KEY`
   - `service_role key` → vai virar `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca vai pro frontend)

### Rodar o schema

1. No painel do Supabase, abra **SQL Editor → New query**.
2. Cole todo o conteúdo de `supabase/migrations/0001_init.sql` e clique em **Run**.
   Isso cria todas as tabelas (`ctos`, `ceos`, `cabos`, `clientes_fibra`, etc.),
   as políticas de RLS (isolamento por empresa) e o bucket de fotos.

### Configurar o e-mail de recuperação de senha

Em **Authentication → Email Templates → Reset Password**, troque o link do
botão para:

```
{{ .SiteURL }}/reset-password?token={{ .TokenHash }}
```

(a tela `ResetPassword.jsx` já espera receber esse `?token=` na URL).

### Ativar login com Google (opcional)

Em **Authentication → Providers → Google**, siga o assistente do Supabase
para criar as credenciais OAuth no Google Cloud Console e colá-las lá.

### Criar sua primeira empresa (tenant)

Depois de criar sua conta pelo próprio app (tela de Registro), volte no
**SQL Editor** e rode (trocando os valores):

```sql
insert into empresas (nome, slug, mkauth_url)
values ('Wianet Telecom', 'wianet', 'https://wianettelecomcanoas.com.br')
returning id;

update profiles set empresa_id = '<uuid-retornado-acima>', role = 'admin'
where email = 'seu@email.com';
```

Sem isso, o login funciona mas o app mostra "usuário não vinculado a uma
empresa" — é o `UserNotRegisteredError` fazendo seu trabalho: proteger o
sistema até um admin liberar o acesso do novo usuário a um tenant.

---

## Passo 2 — Configurar variáveis de ambiente localmente

Copie `.env.example` para `.env.local` na raiz do projeto e preencha com os
valores do Passo 1. O arquivo `.env.local` nunca é commitado (já está no
`.gitignore`).

---

## Passo 3 — Rodar localmente

```bash
npm install
npm run dev
```

As **Vercel Functions** (`/api/*.js`) só rodam com a CLI da Vercel:

```bash
npm install -g vercel
vercel dev
```

Rode `vercel dev` em um terminal (ele sobe as functions, geralmente na porta
3000) e `npm run dev` em outro (o Vite já está configurado para
encaminhar `/api/*` para `localhost:3000` — veja `vite.config.js`).

---

## Passo 4 — Subir para o GitHub

```bash
git init
git add .
git commit -m "Migração WIAGEO: Base44 -> Supabase + Vercel"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/wiageo.git
git push -u origin main
```

---

## Passo 5 — Deploy na Vercel

1. Em [vercel.com](https://vercel.com), **Add New → Project** e importe o
   repositório do GitHub.
2. A Vercel detecta Vite automaticamente (`vercel.json` já está configurado).
3. Em **Settings → Environment Variables**, adicione (para Production **e** Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `ALERT_FROM_EMAIL`
   - `ALERT_FALLBACK_EMAIL`
4. Clique em **Deploy**. A partir daqui, todo `git push` para `main` gera um
   deploy novo automaticamente.

### E-mail de alertas (CTO offline/restaurada)

As functions `notifyCtoOffline`/`notifyCtoRestored` usam a
[Resend](https://resend.com) (tem plano grátis). Crie uma conta, verifique
seu domínio de envio e gere uma API key para `RESEND_API_KEY`.

---

## Arquitetura multi-tenant (SaaS)

Escolhi o modelo de **banco compartilhado com isolamento por linha
(`empresa_id` + RLS)** em vez de uma instância separada por cliente. Motivo:

- **Custo**: um único projeto Supabase/Vercel atende todos os provedores —
  você paga uma vez, não paga por cliente.
- **Manutenção**: um bug corrigido, uma feature nova → todo mundo recebe no
  próximo deploy. Com instâncias separadas você teria que atualizar N vezes.
- **Segurança equivalente**: o Postgres garante, a nível de banco, que a
  Query de um provedor nunca enxerga linhas de outro (RLS), mesmo que haja
  um bug no frontend.

Quando migrar de plano vale a pena considerar uma instância dedicada (ex.:
Supabase próprio) é para um cliente enterprise que exija isso contratualmente
— o schema já suporta isso: basta rodar a mesma migration em um projeto novo.

Cada linha das tabelas de domínio (`ctos`, `ceos`, `cabos`...) tem uma
`empresa_id`. Todo `create()` do frontend injeta automaticamente a empresa do
usuário logado (`src/api/entities.js`); toda leitura/escrita é filtrada pelo
Postgres via RLS — mesmo que alguém manipule a requisição do navegador, não
consegue ler dados de outro provedor.

---

## O que NÃO foi migrado (e por quê)

- **`OAuthConsent.jsx`**: era uma tela específica do recurso "MCP Apps" do
  Base44 (permitir que ferramentas de IA se conectem ao seu app via OAuth).
  Não tinha rota ativa no `App.jsx` e depende de endpoints só do Base44 —
  removida. Se um dia você quiser expor o WIAGEO como uma ferramenta MCP,
  isso é um projeto à parte.
- **CLI/config do Base44** (`base44/config.jsonc`, `base44/entities/*.jsonc`):
  removidos — eram só metadados da plataforma antiga.

---

## Próximas ideias de valor comercial

Veja a lista completa na resposta do chat — os destaques técnicos mais
imediatos para este schema:
1. **Viabilidade automática por CEP/endereço** — já existe a function
   `verificarViabilidadeEndereco`; falta só um endpoint de geocoding (Google/
   Mapbox) para o cliente digitar um endereço em vez de lat/lng.
2. **Cron job de monitoramento** (Vercel Cron) chamando `mkauthStatus` a
   cada 5 min e dependendo do resultado chamar `notifyCtoOffline`/
   `notifyCtoRestored` automaticamente — hoje essas duas functions esperam
   ser chamadas manualmente pelo frontend.
3. **Rotas de fibra**: a tabela `cabos` já guarda `coordenadas` (polyline);
   dá para desenhar isso no mapa junto com CTOs/CEOs.
