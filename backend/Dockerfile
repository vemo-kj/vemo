# 베이스 이미지 설정
FROM node:18-alpine

# 작업 디렉토리 생성
WORKDIR /usr/src/app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# TypeScript 설정 파일 복사
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN apt update && apt install -y curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# 소스 코드 복사
COPY src/ ./src/

# 빌드
RUN npm run build

# 프로덕션 환경 설정
ENV NODE_ENV=production
EXPOSE 5050

# 제발 실행 제발 진짜 제발요
CMD ["npm", "run", "start:prod"]