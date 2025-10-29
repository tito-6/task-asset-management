FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Install dependencies for all workspaces
COPY package.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY packages/common-types/package.json packages/common-types/

RUN npm install --workspaces --include-workspace-root=false

# Copy sources
COPY packages ./packages
COPY backend ./backend

WORKDIR /usr/src/app/backend

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]
