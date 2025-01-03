# Base image
FROM node:18-alpine

# 작업 디렉토리 설정 (backend 한 번만)
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# 필수 패키지 전역 설치 후 의존성 설치
RUN npm install -g @nestjs/cli && \
    npm install && \
    npm install @nestjs/config @nestjs/typeorm typeorm @nestjs/jwt @nestjs/passport passport-jwt bcrypt openai google-auth-library googleapis

# Bundle app source
COPY . .

# nest build 명령어 직접 실행
RUN npx nest build

EXPOSE 5050
CMD ["node", "dist/main.js"]