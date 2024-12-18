FROM node:current-alpine as build
WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn --silent
COPY . /app

ENV NODE_OPTIONS=--openssl-legacy-provider
RUN yarn build

# Running the app
ENV NODE_ENV=production
CMD ["node", "server"]
