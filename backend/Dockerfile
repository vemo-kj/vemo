# 베이스 이미지 설정
FROM node:18-alpine

# 필수 패키지 설치
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# TypeScript 설정 파일 복사
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 소스 코드 복사
COPY src/ ./src/

# 백엔드 애플리케이션 빌드 (TypeScript 컴파일 등)
RUN npm run build

# 프로덕션 환경 설정
ENV NODE_ENV=production
EXPOSE 5050

# 제발 실행 제발 진짜 제발요
CMD ["npm", "run", "start:prod"]