FROM node:18 as builder

# build all pacakges

WORKDIR /usr/src/app/Common_Liveliness
COPY Common_Liveliness/package*.json ./
RUN npm install

WORKDIR /usr/src/app/AVS_WebAPI
COPY AVS_WebAPI/package*.json ./
RUN npm install

WORKDIR /usr/src/app/Task_Performer
COPY Task_Performer/package*.json ./
RUN npm install

COPY . /app

FROM node:18

# docker image for PACAKGE_NAME

ARG PACKAGE_NAME
WORKDIR /app/${PACKAGE_NAME}

# copy deps from builder stage
COPY --from=builder /app/${PACKAGE_NAME}/node_modules /app/${PACKAGE_NAME}/node_modules
COPY --from=builder /app/Common_Liveliness/node_modules /app/Common_Liveliness/node_modules

# copy source code
COPY ${PACKAGE_NAME} /app/${PACKAGE_NAME} 
COPY Common_Liveliness /app/Common_Liveliness

WORKDIR /app/${PACKAGE_NAME}

RUN npm install

EXPOSE 8080
CMD [ "node", "index.js" ]