# SMTP

Welcome to the SMTP service repository. This repository contains the source code for the SMTP servers that are used to receive and review emails.

## Installation

You should be running node `v20.8.1` or higher to run this server. Using `nvm` is recommended.

```bash
nvm use
```

> Install `nvm` from [here](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

Once that is completed you will be able to install the dependencies. We use `yarn` as our package manager. Install the dependencies using:

```bash
yarn install
```

> Install `yarn` from [here](https://yarnpkg.com/getting-started/install).

For local development you will also need to install Docker. Check the [getting started guide](https://docs.docker.com/get-docker/) for details on how to install for your system.

You will also need to create certificates for the agent to upgrade to a TSL connection when requested by the connecting client.

```
openssl req -x509 -newkey rsa:4096 -keyout service/smtp-agent/.secret/smtp-service.agent.server.key -out service/smtp-agent/.secret/smtp-service.agent.server.certificate -days 1 -nodes -subj "/CN=localhost"
```

> Install `openssl` [here](https://openssl-library.org/source/) if you have not already got it on your system

## Local Development

To run a local server use docker compose.

```bash
docker compose up
```

## Acceptance Testing

You can run automation tests that confirm compliance with [RFC-821](https://datatracker.ietf.org/doc/html/rfc821) and [RFC-5321](https://datatracker.ietf.org/doc/html/rfc5321) us the following command.

```bash
yarn workspace smtp-agent run acceptance-test
```

## Demo

Checkout the [demo](./DEMO.md) document to be taken on a guided tour of the applications and agents.

## Notes

I have removed the code required for authentication on the admin panel to aid with setup for the demo. Some of this code has been removed entirely and some has simply been disabled via comments. Additionally some of the config files that would normally be untracked are committed so that you can avoid setting those up each time.

This server ran online for several months recieving emails from mailing lists, news letters, spammers and even a few security companies. During that time it did not crash once and was able to handle a elevated connection attack over several hours without falling over. When it was deployed it ran on a docker swarm with traffic being split over several instances.

The final point to raise is that almost all of this code was written by myself. AI did not write most of this code.
