FROM node:18

RUN npm install -g npm@10.5.0

ARG NPM_TOKEN=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

WORKDIR /app

RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > $HOME/.npmrc

RUN npm i -g @othentic/othentic-cli

ENTRYPOINT [ "othentic-cli" ]
