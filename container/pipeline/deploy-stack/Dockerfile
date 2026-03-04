ARG ALPINE_VERSION=3.21.2

FROM alpine:${ALPINE_VERSION}

# Install "ssh" and "scp"
RUN apk add --no-cache --update \
    bash \
    curl \
    openssh \
    && rm -rf /var/cache/apk/* /tmp/*
