# Stage 1: Build Stage
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json 및 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 백엔드 애플리케이션 빌드 (TypeScript 컴파일 등)
RUN npm run build

# Stage 2: Production Stage
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

# package.json 및 package-lock.json 복사
COPY package*.json ./

# 프로덕션 의존성 설치
RUN npm install --only=production

# 빌드된 애플리케이션 복사
COPY --from=builder /usr/src/app/dist ./dist

# 포트 노출
EXPOSE 5050

# 백엔드 애플리케이션 시작
CMD ["node", "dist/main.js"]