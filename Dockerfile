FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python

USER node

RUN npm install || exit 0

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "start.js" ]