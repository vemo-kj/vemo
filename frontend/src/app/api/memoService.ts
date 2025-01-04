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
};