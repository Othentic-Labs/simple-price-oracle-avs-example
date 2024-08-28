FROM node:22.6

RUN npm install -g npm@10.5.0

ARG NPM_TOKEN=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

WORKDIR /app

RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > $HOME/.npmrc

RUN npm i -g @othentic/othentic-cli

ENTRYPOINT [ "othentic-cli" ]
