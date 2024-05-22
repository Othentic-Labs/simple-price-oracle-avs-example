FROM node:18

RUN npm install -g npm@10.5.0

ARG NPM_TOKEN=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

WORKDIR /app

RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > $HOME/.npmrc

RUN npm i -g @othentic/othentic-cli-test

ENTRYPOINT [ "othentic-cli" ]
