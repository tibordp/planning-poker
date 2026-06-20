# syntax=docker/dockerfile:1

# --- Install all dependencies once (shared base for build + prod prune) ---
FROM node:24-alpine AS deps
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# --- Build the Next.js app ---
FROM deps AS build
COPY . .
RUN yarn build

# --- Prune to production-only deps, reusing the warm yarn cache (offline) ---
FROM deps AS proddeps
RUN yarn install --frozen-lockfile --production --prefer-offline \
  && yarn cache clean \
  # @next/swc-* are native compiler binaries used only at build time; the
  # production server never invokes SWC, so they're dead weight in the runtime.
  && rm -rf node_modules/@next/swc-*

# --- Runtime stage: slim image with just what the server needs ---
# The custom WebSocket server (server/index.ts) is run through tsx, which is a
# production dependency; the Next.js build is served via its request handler.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PATH=/app/node_modules/.bin:$PATH
COPY --from=proddeps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json /app/next.config.mjs ./
COPY --from=build /app/server ./server
COPY --from=build /app/src ./src
EXPOSE 3000
CMD ["tsx", "server/index.ts"]
