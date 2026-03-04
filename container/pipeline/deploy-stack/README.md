# Deploy Stack Container

## Building the container

Then, build the container by running the following command:

```bash
docker build -t $CONTAINER_REGISTRY_URL/smtp/pipeline/deploy-stack:latest container/pipeline/deploy-stack
```

> The tag (`-t`) must begin with `$CONTAINER_REGISTRY_URL/smtp` but can contain anything after that (within limitations set by Gitlab). Our convention is to use the project name `services/pipeline` followed by the container name. In this case `deploy-stack`. This approach avoids any conflicts with other projects in the registry.

## Pushing the container

Finally, push the container to the registry by running the following command:

```bash
docker push $CONTAINER_REGISTRY_URL/smtp/pipeline/deploy-stack:latest
```
