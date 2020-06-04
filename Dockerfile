FROM node AS build-env

RUN useradd -m docker
USER docker
WORKDIR /home/docker
COPY . .
RUN npm install

FROM node:alpine

WORKDIR /app

COPY --from=build-env /home/docker /app

ENTRYPOINT node index.js
