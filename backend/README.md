# Backend API

Express.js API powered by Prisma and PostgreSQL for managing companies, assets, tasks, and notifications.

## Setup

```cmd
npm install
npm run prisma:generate
npm run prisma:migrate --name init
npm run dev
```

Set environment variables in `.env` (see `.env.example`).
