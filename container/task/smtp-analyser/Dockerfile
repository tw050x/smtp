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

## Build the project
RUN yarn workspace smtp-analyser run js:compile

# Dendencies Image
FROM node:23 AS dependencies
WORKDIR /dependencies
COPY . /dependencies

## Set the environment variables
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_ENV=${NODE_ENV}

## Install production dependencies
RUN yarn workspaces focus smtp-analyser --production

# Final Image
FROM node:23.6.1-alpine3.20
RUN npm install -g tsx --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/artifact/service/smtp-analyser /srv/
COPY --from=dependencies /dependencies/task/smtp-analyser/node_modules /srv/node_modules

## Set the start command
CMD [ "node", "run.js" ]
