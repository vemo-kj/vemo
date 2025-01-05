// memoService.ts
'use client';

// 환경 변수에서 API URL을 가져오거나 기본값을 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
console.log('Using API URL:', API_URL);

// 1. 스토리지 타입을 일관되게 유지 (localStorage 사용)
const storage = sessionStorage; // 또는 sessionStorage로 변경 가능
console.log('Using storage:', storage);
// 2. 토큰 관리를 위한 유틸리티 함수들 추가
const TOKEN_KEY = 'token';

// 토큰을 스토리지에 저장하는 함수
export const setToken = (token: string) => {
    storage.setItem(TOKEN_KEY, token);
};

// 스토리지에서 토큰을 가져오는 함수
export const getToken = () => {
    const token = storage.getItem(TOKEN_KEY);
    console.log('Getting token from storage:', token);
    return token;
};

// 스토리지에서 토큰을 제거하는 함수
export const removeToken = () => {
    storage.removeItem(TOKEN_KEY);
};

// 3. 인증 헤더를 가져오는 함수
const getAuthHeader = () => {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

// --------------------------------------
// 1) 비디오별 Memos 생성
// --------------------------------------
export const createMemos = async (videoId: string) => {
    try {
      // 먼저 videoId로 기존 memos가 있는지 확인
      const existingMemos = await memoService.getMemosByVideoId(data.videoId, data.userId);
      
      if (existingMemos) {
        return existingMemos; // 이미 존재하는 memos 반환
      }

      // 없으면 새로 생성
      const res = await fetch(`${API_URL}/home/memos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // 404 에러인 경우 playlist를 통해 생성 시도
        if (res.status === 404) {
          const playlistRes = await fetch(`${API_URL}/home/playlist`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: "New Playlist",
              videoIds: [data.videoId]
            })
          });

          if (!playlistRes.ok) {
            throw new Error(`Failed to create playlist: ${playlistRes.statusText}`);
          }

          const playlistData = await playlistRes.json();
          return {
            id: playlistData.memos.id,
            ...playlistData.memos
          };
        }
        throw new Error(`Failed to create memos: ${res.statusText}`);
      }

      const response = await res.json();
      return {
        id: response.id || response.memosId,
        ...response
      };
    } catch (error) {
        console.error('Error in createMemos:', error);
        throw error;
    }
};