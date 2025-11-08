FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    pnpm install turbo --global

FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml* ./
COPY . .
RUN turbo prune --scope=cms --docker

FROM base AS installer
WORKDIR /usr/src/app


COPY .gitignore .gitignore
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /usr/src/app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /usr/src/app/out/full/ .

COPY apps/cms/.env ./apps/cms/.env


RUN pnpm install --frozen-lockfile
COPY turbo.json turbo.json
RUN turbo run build --filter=cms...

FROM node:22-alpine AS runner
WORKDIR /usr/src/app

RUN apk add --no-cache openssl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/package.json ./package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/cms/package.json ./apps/cms/package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/cms/dist ./apps/cms/dist
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/cms/node_modules ./apps/cms/node_modules
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/cms/tsconfig.json ./apps/cms/tsconfig.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/cms/public ./apps/cms/public
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/cms/src ./apps/cms/src
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/cms/.env ./apps/cms/.env

USER nodejs
WORKDIR /usr/src/app/apps/cms
EXPOSE 1337
CMD ["npm", "run", "start"]
