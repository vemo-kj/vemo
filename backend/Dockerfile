# Base image
FROM node:18-alpine

# 작업 디렉토리 설정 (backend 한 번만)
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# 필수 패키지만 설치하고 캐시 삭제
RUN npm install -g @nestjs/cli && \
    npm install --production && \
    npm install @nestjs/config @nestjs/typeorm typeorm @nestjs/jwt @nestjs/passport passport-jwt bcrypt openai google-auth-library googleapis && \
    npm cache clean --force

# Bundle app source
COPY . .

# nest build 명령어 직접 실행
RUN npx nest build

EXPOSE 5050
CMD ["node", "dist/main.js"]