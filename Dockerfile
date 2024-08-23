FROM node:22.6

RUN npm install -g npm@10.5.0

ARG NPM_TOKEN=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

WORKDIR /app

RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > $HOME/.npmrc

RUN npm i -g @othentic/othentic-cli

ENTRYPOINT [ "othentic-cli" ]
