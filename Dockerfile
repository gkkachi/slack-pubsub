FROM node AS build-env

RUN useradd -m docker
USER docker
WORKDIR /home/docker
COPY . .
RUN npm install

FROM node:alpine

WORKDIR /app

COPY --from=build-env /home/docker/node_modules /app/node_modules
COPY --from=build-env /home/docker/index.js     /app/index.js

ENTRYPOINT node index.js
