FROM node:18

RUN npm install -g npm@10.5.0

ARG NPM_TOKEN=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

WORKDIR /app

RUN npm install dotenv

RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > $HOME/.npmrc

RUN npm i -g @othentic/othentic-cli

ADD index.js ./

ADD .env ./

ADD package*.json ./

RUN npm ci

ENTRYPOINT ["node", "index.js" ]
