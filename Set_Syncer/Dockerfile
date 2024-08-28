FROM node:18

RUN npm install -g npm@10.5.0

ARG NPM_TOKEN=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

WORKDIR /app

RUN npm install dotenv

RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > $HOME/.npmrc

RUN npm i -g @othentic/othentic-cli

ADD ./Set_Syncer/index.js ./

ADD .env ./

ADD ./Set_Syncer/package*.json ./

RUN npm ci

ENTRYPOINT ["node", "index.js" ]
