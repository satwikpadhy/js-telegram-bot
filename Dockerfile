FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN apk add --no-cache curl

HEALTHCHECK --interval=35s --timeout=4s CMD curl -f http://localhost:8321/health || exit 1
EXPOSE 8321

CMD [ "node", "index.js"]
