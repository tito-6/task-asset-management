FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY packages/common-types/package.json packages/common-types/

RUN npm install --workspaces --include-workspace-root=false

COPY packages ./packages
COPY frontend ./frontend

WORKDIR /usr/src/app/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
