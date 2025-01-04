const API_URL = 'http://localhost:5050'; // 백엔드 서버 주소

export const memoService = {
  // 메모 생성
  async createMemo(data: { timestamp: string; description: string; memosId: number }) {
    const response = await fetch(`${API_URL}/memo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // 오류 처리
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create memo: ${errText}`);
    }

    // 응답 JSON 파싱
    return response.json();
  },

  // 메모 목록 조회
  async getMemos(memosId: number) {
    const response = await fetch(`${API_URL}/memo?memosId=${memosId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to get memos: ${errText}`);
    }

    return response.json();
  },

  // 메모 수정
  async updateMemo(data: { id: number; timestamp: string; description: string }) {
    const response = await fetch(`${API_URL}/memo/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to update memo: ${errText}`);
    }

    return response.json();
  },

  // 메모 삭제
  async deleteMemo(id: number) {
    const response = await fetch(`${API_URL}/memo/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to delete memo: ${errText}`);
    }
    // 삭제 성공 시 보통 빈 본문이므로 별도의 JSON 파싱 없이 끝
  },

  // 기존 createMemos 함수는 유지
  createMemos: async (data: {
    title: string;
    description: string;
    videoId: string;
    userId: number;
  }) => {
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
      console.error('Error creating memos:', error);
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