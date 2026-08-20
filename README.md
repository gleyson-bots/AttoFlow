# AttoFlow

Plataforma competitiva para comunidade de Free Fire com cadastro, autenticação, painel do jogador, painel administrativo, campeonatos, inscrições por créditos, premiações e programa de indicação.

> O MVP modela campeonatos com taxa de inscrição e premiação fixa em créditos da plataforma. Não há odds, apostas em resultados ou mecanismo de cassino.

## Stack
- Next.js 16 + React 19
- TypeScript
- Prisma ORM + SQLite no desenvolvimento
- Sessão própria via cookie HTTP-only assinado
- Senhas protegidas com scrypt
- TikTok Pixel DA3FTS3C77UBMOG4PGF0

## Rodando localmente
```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Admin de desenvolvimento: `admin@attoflow.local` / `Admin@123`. Troque a senha via `ADMIN_PASSWORD` antes do seed e nunca use a padrão em produção.

## Já implementado
- Landing AttoFlow
- Cadastro/login/logout
- Roles USER/ADMIN e bloqueio de usuário
- Carteira de créditos
- Campeonatos, vagas e inscrições
- Premiações/histórico
- Indique e ganhe
- Painel administrativo
- TikTok Pixel global
- Layout responsivo

## Próximas etapas
PostgreSQL de produção, equipes/squads, check-in/lobby, resultados/ranking, distribuição de premiações, pagamentos permitidos, auditoria, notificações e páginas legais/LGPD.
