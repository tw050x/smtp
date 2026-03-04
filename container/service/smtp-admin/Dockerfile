ARG NODE_ENV=production

# Build Image
FROM node:23 AS build
WORKDIR /build
COPY . /build

## Set the environment variables
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_ENV=${NODE_ENV}

## Install all dependencies
RUN yarn install --immutable
RUN npm install -g @tailwindcss/cli tailwindcss

## Build the project
RUN cd ./service/smtp-admin && npx @tailwindcss/cli --input ./style.css --output ./public/stylesheet.css --minify
RUN yarn workspace smtp-admin run js:compile

# Dendencies Image
FROM node:23 AS dependencies
WORKDIR /dependencies
COPY . /dependencies

## Set the environment variables
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_ENV=${NODE_ENV}

## Install production dependencies
RUN yarn workspaces focus smtp-admin --production

# Final Image
FROM node:23.6.1-alpine3.20
RUN apk add --no-cache curl
RUN npm install -g tsx --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/artifact/service/smtp-admin /srv/
COPY --from=build /build/service/smtp-admin/public /srv/public
COPY --from=build /build/service/smtp-admin/template /srv/template
COPY --from=dependencies /dependencies/service/smtp-admin/node_modules /srv/node_modules

## Set the start command
CMD [ "node", "serve.js" ]
