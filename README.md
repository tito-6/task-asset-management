# Asset & Task Management Platform

Monorepo housing the full-stack application for managing digital marketing assets and related tasks across multiple companies. The stack comprises an Express/Prisma backend and a Vite/React frontend with shared TypeScript types.

## Getting Started

1. Install dependencies:
   ```cmd
   npm install
   ```
2. Copy the environment templates and update values:
   ```cmd
   copy backend\.env.example backend\.env
   copy frontend\.env.example frontend\.env
   ```
3. Bring up the stack (database, API, and web app):
   ```cmd
   docker-compose up --build
   ```

See `backend/README.md` and `frontend/README.md` for service-specific instructions.
