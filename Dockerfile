# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /repo
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

FROM base AS deps
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY nest-cli.json tsconfig*.json ./
COPY apps ./apps
COPY libs ./libs
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG APP_NAME=api-gateway
RUN pnpm -w exec nest build ${APP_NAME} \
 && ls -la /repo/dist/apps/${APP_NAME} || (echo "No se generó dist/apps/${APP_NAME}" && exit 1)

FROM deps AS deploy
ARG APP_NAME=api-gateway
RUN pnpm deploy --filter "./apps/${APP_NAME}" --prod --legacy /out

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production

# node_modules y package.json mínimos
COPY --from=deploy --chown=node:node /out/node_modules ./node_modules
COPY --from=deploy --chown=node:node /out/package.json ./package.json

# build de la app
ARG APP_NAME=api-gateway
COPY --from=build --chown=node:node /repo/dist/apps/${APP_NAME} ./dist

# ✅ usar el usuario 'node' que ya existe en la imagen
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
