FROM node:16-alpine AS base

FROM base as node_modules

COPY ["./package.json", "./yarn.lock", "./"]

RUN yarn --prod --silent

FROM base as builder
WORKDIR /build

COPY --from=node_modules /node_modules/ ./node_modules/
COPY --from=node_modules /package.json .
COPY --from=node_modules /yarn.lock .
COPY ./tsconfig.json .
COPY ./src ./src

RUN yarn install --silent
RUN yarn run build

FROM base
WORKDIR /app

COPY --from=node_modules /node_modules/ ./node_modules/
COPY --from=node_modules /package.json ./package.json
COPY --from=builder /build/dist/ ./dist/

CMD node dist
EXPOSE 5000
