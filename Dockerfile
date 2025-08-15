FROM public.ecr.aws/docker/library/node:22-alpine

WORKDIR /usr/src/app

# Add dependency files  install
COPY package*.json ./

RUN apk add --no-cache --virtual .build-deps python3~=3.12 make~=4.4 g++~=14 \
  && npm ci \
  && apk del .build-deps

COPY . .

RUN wget -O global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

ARG GIT_HASH=${GIT_HASH:-undefined_hash}

RUN npm run build:api

# Create a non-root user
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001 -G nodejs \
  && chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 5000
ENTRYPOINT [ "npm" ]
CMD ["run", "start:api"]
