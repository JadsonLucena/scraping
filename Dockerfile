FROM node:alpine

WORKDIR /usr/src/app

COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./src ./src

ENV NODE_ENV=production

RUN npm i -g npm@latest
RUN npm i --omit=dev

USER node

CMD npm start