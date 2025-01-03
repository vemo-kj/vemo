FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g @nestjs/cli && \
    npm install

COPY . .
RUN npm run build

EXPOSE 5050
CMD ["node", "dist/main.js"]
