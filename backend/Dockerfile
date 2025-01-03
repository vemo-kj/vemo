# Base image
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 파일 복사
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 개발 의존성을 포함한 모든 패키지 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 프로덕션 환경을 위한 설정
ENV NODE_ENV=production

EXPOSE 5050

CMD ["npm", "run", "start:prod"]