FROM node:22-alpine AS builder
WORKDIR /app
COPY backend/package.json backend/pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY backend/tsconfig.json backend/src ./src/
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "dist/index.js"]
