FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Install dependencies for all workspaces
COPY package.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY packages/common-types/package.json packages/common-types/

RUN npm install --workspaces --include-workspace-root=false

# Install tsx globally for development
RUN npm install -g tsx

# Copy sources
COPY packages ./packages
COPY backend ./backend

WORKDIR /usr/src/app/backend

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

CMD ["tsx", "watch", "src/server.ts"]
