FROM node:alpine

WORKDIR /usr/src/app

COPY --chown=node:node ./package.json ./
COPY --chown=node:node ./src ./src

ENV NODE_ENV=production

RUN npm install -g npm@latest
RUN npm install --omit=dev

USER node

CMD npm start