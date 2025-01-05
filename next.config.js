/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  },
  // TODO: 확인 유튜브 재생 시간 가져오기 
  scripts: [
    'https://www.youtube.com/iframe_api'
  ]
};

module.exports = nextConfig; 