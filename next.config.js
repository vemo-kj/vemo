/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 404 페이지 빌드 문제 해결을 위한 설정
  output: 'standalone',
}

module.exports = nextConfig