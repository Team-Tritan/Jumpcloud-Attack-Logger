FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npm i typescript ts-node -g

COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]