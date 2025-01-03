# Stage 1: Build Stage
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json 및 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 백엔드 애플리케이션 시작
CMD ["node", "dist/main.js"]
