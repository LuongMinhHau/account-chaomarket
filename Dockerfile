# ── Build stage ──
FROM node:24-alpine AS builder

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm approve-builds sharp @sentry/cli
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXTAUTH_URL=https://account.chaomarket.com
ENV NEXTAUTH_URL=$NEXTAUTH_URL

RUN pnpm build

# ── Production stage ──
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built artifacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
