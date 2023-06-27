FROM public.ecr.aws/docker/library/node:16.13.1-alpine

WORKDIR /usr/src/app

# Add dependency files  install
COPY package*.json ./

RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci \  
    && apk del .build-deps

COPY . .

RUN wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem

ARG GIT_HASH=${GIT_HASH:-undefined_hash}

RUN npm run build:api

EXPOSE 5000
ENTRYPOINT [ "npm" ]
CMD ["run", "start:api"]