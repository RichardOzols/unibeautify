FROM node:22.23.4-alpine
MAINTAINER Glavin Wiechert <glavin.wiechert@gmail.com>

# Defines our working directory in container
WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . ./
RUN npm run build

ENV PORT=8080

CMD ["npm", "run", "static"]
