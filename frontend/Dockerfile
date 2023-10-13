FROM node:16

WORKDIR /app

COPY ["package.json","package-lock.json", "yarn.lock", "./"]

RUN yarn

COPY . .

EXPOSE 3000