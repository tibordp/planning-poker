FROM node:22-alpine AS build
WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn --silent --frozen-lockfile
COPY . /app

RUN yarn build

# Running the app: the Next.js build is served by the custom WebSocket server
# (server/index.ts), executed through tsx.
ENV NODE_ENV=production
EXPOSE 3000
CMD ["yarn", "start"]
