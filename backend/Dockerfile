# 베이스 이미지 설정
FROM node:22

# 작업 디렉토리 생성
WORKDIR /usr/src/app

# 루트 package.json 복사
COPY package.json .
COPY backend/package.json ./backend/

# 의존성 설치
RUN npm install

WORKDIR /usr/src/app/backend
COPY backend/ .

# 빌드
RUN npm run build

# 개발 모드로 실행
CMD ["npm", "run", "start:dev"]

EXPOSE 5050