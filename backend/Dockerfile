# Base image
FROM node:18-alpine

# 작업 디렉토리 설정 (backend 한 번만)
WORKDIR /usr/src/app

# package.json과 함께 TypeScript 설정 파일들도 복사
COPY package*.json tsconfig*.json nest-cli.json ./

# 필수 패키지만 설치하고 캐시 삭제
RUN npm install -g @nestjs/cli && \
    npm install --production && \
    npm install @nestjs/config @nestjs/typeorm typeorm @nestjs/jwt @nestjs/passport passport-jwt bcrypt openai google-auth-library googleapis && \
    npm cache clean --force

# 소스 코드 복사
COPY . .

# nest build 명령어 직접 실행
RUN npx nest build

EXPOSE 5050
CMD ["node", "dist/main.js"]