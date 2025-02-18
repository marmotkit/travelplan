FROM node:16-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm install

COPY server .

EXPOSE 5001

CMD ["node", "index.js"] 