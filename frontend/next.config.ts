import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    experimental: {
        optimizeCss: true,
    },
    // CSS 모듈 기본 설정 사용
};

export default nextConfig;
