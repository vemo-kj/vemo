# Alpine 3.19로 베이스 이미지 설정
FROM node:18-alpine3.19

# 필수 패키지 설치
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    chromium \
    chromium-chromedriver \
    harfbuzz \
    nss \
    freetype \
    ttf-freefont \
    ttf-liberation \
    font-noto \
    dbus \
    udev \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# 한글 폰트 설치
RUN apk add --no-cache \
    font-noto-cjk

# Puppeteer 환경변수 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 작업 디렉토리 설정
WORKDIR /usr/src/app


# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install dompurify
RUN npm install puppeteer
RUN npm install aws-sdk
RUN npm install

# TypeScript 설정 파일 복사
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 소스 코드 복사
COPY src/ ./src/

# 빌드
RUN npm run build

# 프로덕션 환경 설정
ENV NODE_ENV=production
EXPOSE 5050

# 실행
CMD ["npm", "run", "start:prod"]