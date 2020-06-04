FROM node AS build-env

COPY . .
RUN npm install --production --no-bin-links

FROM node:alpine

COPY --from=build-env node_modules node_modules
COPY --from=build-env index.js index.js

ENTRYPOINT node index.js
