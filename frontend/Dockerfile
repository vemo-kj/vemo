FROM node:22

WORKDIR /usr/src/app

COPY package.json .
COPY frontend/package.json ./frontend/

RUN npm install

WORKDIR /usr/src/app/frontend
COPY frontend/ .

CMD ["npm", "run", "dev"]

EXPOSE 3000
