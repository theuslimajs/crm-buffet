# Aplicação dos códigos (CRM Buffet GM)

1) Copie os arquivos deste pacote para dentro do seu projeto (mantendo os mesmos caminhos).
2) Garanta `DATABASE_URL` no `.env`.
3) Rode as migrations e o seed:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Deploy (Vercel)
No build, execute migrations antes do `next build`. Opções:
- Ajustar `package.json`:
  - `"build": "prisma migrate deploy && prisma generate && next build"`
- Ou usar o painel da Vercel (Build Command).

## Admin padrão
Email: admin@buffetgm.com
Senha: admin123
