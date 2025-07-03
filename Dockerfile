FROM node:22.6

RUN npm install -g npm@10.5.0

WORKDIR /app

RUN npm i -g @othentic/cli
RUN npm i -g @othentic/node

ENTRYPOINT [ "otnode" ]