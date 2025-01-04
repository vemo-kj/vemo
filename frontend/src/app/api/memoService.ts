// memoService.ts
'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
console.log('Using API URL:', API_URL);

// 인증 토큰 헤더
const getAuthHeader = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    console.log('Using token:', token);

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

// --------------------------------------
// 1) 비디오별 Momos 생성
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
  },

  // 새로운 getMemosByVideoId 함수 추가
  getMemosByVideoId: async (videoId: string, userId: number) => {
    const res = await fetch(`${API_URL}/home/memos?videoId=${videoId}&userId=${userId}`);
    
    if (!res.ok) {
      if (res.status === 404) {
        return null; // 메모가 없는 경우
      }
      throw new Error(`Failed to get memos: ${res.statusText}`);
    }

    return await res.json();
  }
};