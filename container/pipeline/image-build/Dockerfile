ARG DOCKER_VERSION=27.4.1-dind
ARG NODE_VERSION=20.8.1

FROM docker:${DOCKER_VERSION}

# Install Node.js and Corepack
RUN apk add --no-cache --update bash curl nodejs npm \
    && npm install -g corepack \
    && corepack enable \
    && corepack prepare yarn@4.9.1 --activate \
    && rm -rf /var/cache/apk/* /tmp/*
