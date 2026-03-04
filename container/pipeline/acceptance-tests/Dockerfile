FROM node:20

# Enable and set Yarn 4 using Corepack
RUN corepack enable \
    && corepack prepare yarn@4.9.1 --activate

# Install tsx globally
RUN npm install -g tsx
