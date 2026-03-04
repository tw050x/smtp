# Continous Delivery

This repo uses custom images during the CI/CD process. These images are built and pushed to the registry locally. The images are then used in the deployment process. This document outlines how to build and push these images.

## Building a container

Containers are not build in CI. You instead have to build the container locally and push that container to the registry. Each container has its own project but the command to build them are them same. Just be sure to swap out the path to the project in the command.

Start by loading the environment variables into the environment. This can be done by running the following commands in the root of the repository:

```bash
set -a
source container/pipeline/.env
set +a
```

> If this file does not exist then you will need to create it. The `container/pipeline/.env.example` file can be used as a template.

### Logging into the registry

Then login to the registry by running the following command:

```bash
echo $CONTAINER_REGISTRY_ACCESS_TOKEN | docker login --password-stdin --username $CONTAINER_REGISTRY_USERNAME $CONTAINER_REGISTRY_URL
```

> If you cannot login then you cannot push any built containers to the registry.
