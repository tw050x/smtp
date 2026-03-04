# Local Development

## Setup

The run the local development server run the following command in the root of the repository

```bash
docker compose up
```

This will build a docker image if it doesnt already exist and download all images that are required.

## Force rebuild the server

If you need to rebuild the container image then you can run the above command with the `--build` flag

```bash
docker compose up --build
```

Alternatively you can clear all images and containers and start from scratch

```bash
docker system prune -a
```

## Accessing the server

The easiest way to interact with the server is to use `telnet` command line utility. You can connect to the server by running the following command

```bash
telnet localhost 9025
```

> The server is running on port 9025. This is the port on the host system. Not the port that the server is running on within the container.

An alternative way to interact with the server is to use a `node` script and make use of the `net` module. The following script will connect to the server and send a message

```javascript
const net = require('net');

const client = net.createConnection({ port: 9025 }, () => {
  console.log('connected to server');
  client.write('Hello, server! I am a client');
});

client.on('data', (data) => {
  console.log(data.toString());
  client.end();
});

client.on('end', () => {
  console.log('disconnected from server');
});
```

We use this approach in our [acceptance tests](./acceptance-testing.md) to interact with the server.

If you use a node script to interact with the local development server then this should not be committed to the repo unless it is written as an [acceptance test](./acceptance-testing.md).

# Development vs Production

When running the server for local development you have access to Docker Compose which allows you to run the server locally. The `compose.yaml` file in the root of the repository is used for production deployments. If you wish to update the compose file for local development then you should update the `compose.development.yaml` file instead. This file overrides the configuration in the `compose.yaml` file and turns the production server into a local development server.

> Note: Any changes to the `compose.development.yaml` file should be commited to the repository. Keep in mind that this will affect all developers running the server locally.

> Note: The deployment for the SMTP server in production can be found in the `.gitlab-ci.yml` file. If you inspect that file you will see that the `compose.yaml` file is securely copied to the server and then the `docker stack deploy` command is run. This is how the server is deployed in production.

### Hot Reloading

The local development server has been setup such that it will automatically reload after a change has been made to the code. This is done using the `tsx` package. You can see this in the `command` porperty of the `compose.development.yaml` file under the `agent` service.

### Environment Variables

We do not use environment variables
