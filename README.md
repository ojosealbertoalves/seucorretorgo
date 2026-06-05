# Seu Corretor GO

Plataforma de consultoria imobiliária com agente de IA para imóveis novos em Goiânia.

## Stack

- **Next.js 16** (App Router)
- **Prisma 7** + PostgreSQL (Supabase)
- **Claude Sonnet** (agente Alberto, via Anthropic SDK)
- **NextAuth** (painel admin)
- **Tailwind CSS 4**

## Funcionalidades

- **Chat público** — agente Alberto qualifica o cliente e apresenta empreendimentos compatíveis com busca inteligente no banco
- **Painel admin** — cadastro de incorporadoras, empreendimentos, tipologias e fotos; visualização de leads
- **Galeria de fotos** — cards com navegação de fotos por empreendimento

## Setup local

```bash
# 1. Clone e instale dependências
npm install

# 2. Copie e preencha as variáveis de ambiente
cp .env.example .env.local

# 3. Gere o cliente Prisma e rode as migrations
npx prisma generate
npx prisma migrate deploy

# 4. Crie o usuário admin
npx tsx scripts/seed-admin.ts

# 5. Suba o servidor de desenvolvimento
npm run dev
```

Acesse o painel admin em `http://localhost:3000/admin/login`
- Email: `admin@seucorretorgo.com.br`
- Senha: `Admin@2024`

## Variáveis de ambiente

Veja `.env.example` para a lista completa. Configure no Railway via **Variables** no dashboard do projeto.

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL pooler Supabase (porta 6543, pgbouncer) |
| `DIRECT_URL` | URL direta Supabase (porta 5432, para migrations) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima Supabase |
| `NEXTAUTH_SECRET` | Secret para JWT do NextAuth |
| `NEXTAUTH_URL` | URL pública da aplicação |
| `ANTHROPIC_API_KEY` | Chave da API Anthropic |

## Deploy no Railway

O arquivo `railway.json` já está configurado. O deploy:
1. Gera o cliente Prisma (`prisma generate`)
2. Faz build do Next.js (`next build`)
3. Roda as migrations pendentes (`prisma migrate deploy`)
4. Inicia a aplicação (`next start`)

Configure as variáveis de ambiente no painel do Railway antes do primeiro deploy.
