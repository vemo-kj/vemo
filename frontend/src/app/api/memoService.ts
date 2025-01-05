// [수정됨] memoService.ts
'use client';

// 환경 변수에서 API URL을 가져오거나 기본값을 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
console.log('Using API URL:', API_URL);

// 스토리지 (sessionStorage)
const storage = sessionStorage;
const TOKEN_KEY = 'token';

export const setToken = (token: string) => {
    storage.setItem(TOKEN_KEY, token);
};
export const getToken = () => {
    const token = storage.getItem(TOKEN_KEY);
    console.log('Getting token from storage:', token);
    return token;
};
export const removeToken = () => {
    storage.removeItem(TOKEN_KEY);
};

// 인증 헤더
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

// ----------------------------------------------------------------
// (1) 비디오별 Memos 컨테이너 생성 or 조회
//     백엔드: POST /home/memos/:videoId
// ----------------------------------------------------------------
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

// Memo 관련 인터페이스 추가
interface CreateMemoData {
    timestamp: string;    // 유튜브 재생 시간
    description: string;
    memosId: number;
}
interface UpdateMemoData {
    id: number;
    timestamp: string;
    description: string;
}

export const memoService = {
    // 생성
    async createMemo(data: CreateMemoData) {
        try {
            const requestData = {
                timestamp: data.timestamp,
                description: data.description || '',
                memosId: data.memosId,
            };

            console.log('Sending memo data:', requestData); // 디버깅용

            const response = await fetch(`${API_URL}/memo`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Server error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to create memo:', error);
            throw error;
        }
    },

    // 수정
    async updateMemo(data: UpdateMemoData) {
        try {
            const requestData = {
                ...data,
                timestamp: new Date(data.timestamp),
            };

            // [수정됨] PUT /memo/:id
            const response = await fetch(`${API_URL}/memo/${data.id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(requestData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to update memo:', error);
            throw error;
        }
    },

    // 삭제
    async deleteMemo(id: number) {
        try {
            // [수정됨] DELETE /memo/:id
            const response = await fetch(`${API_URL}/memo/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to delete memo:', error);
            throw error;
        }
    },
};