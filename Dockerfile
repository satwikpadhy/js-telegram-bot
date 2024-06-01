FROM node:18-buster

WORKDIR /app

COPY . .

RUN npm install

CMD [ "node", "index.js", "dev" ]
