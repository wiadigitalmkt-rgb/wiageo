# WIAGEO

Sistema de gerenciamento e documentação de rede para provedores de internet
(ISPs) — mapa de rede, CTOs, CEOs, cabos, POPs, viabilidade técnica e
integração com MK-AUTH.

Stack: **React + Vite** (frontend), **Supabase** (Postgres, Auth, Storage),
**Vercel** (hosting + Functions serverless em `/api`). Sem nenhuma
dependência do Base44.

Veja **`GUIA_MIGRACAO.md`** para o passo a passo completo de configuração
(Supabase, variáveis de ambiente, deploy na Vercel).

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev
```

Para as Vercel Functions em `/api` funcionarem localmente também, rode em
outro terminal:

```bash
npm install -g vercel
vercel dev
```

## Build de produção

```bash
npm run build
```
