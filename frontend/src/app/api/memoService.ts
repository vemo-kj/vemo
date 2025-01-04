const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
console.log('Using API URL:', API_URL);

const getAuthHeader = () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  console.log('Using token:', token); // 토큰 값 확인
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const memoService = {
  // memos 생성
  createMemos: async (data: {
    title: string;
    description: string;
    videoId: string;
  }) => {
    try {
      const response = await fetch(`${API_URL}/home/memos`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to create memos: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating memos:', error);
      throw error;
    }
  },

  // 비디오 ID로 memos 조회 (VemoService의 getCommunityMemos 사용)
  getMemosByVideoId: async (videoId: string) => {
    try {
      const response = await fetch(`${API_URL}/vemo/community-memos/${videoId}?filter=mine`, {
        headers: getAuthHeader()
      });

      if (response.status === 404) {
        // memos가 없으면 새로 생성
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get memos: ${response.statusText}`);
      }

      const data = await response.json();
      // 현재 사용자의 memos만 필터링
      return data.memos[0] || null;
    } catch (error) {
      console.error('Error getting memos:', error);
      return null;
    }
  }
};

export const createMemos = async (videoId: string) => {
  try {
    const response = await fetch(`${API_URL}/home/memos`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        title: "New Memo",
        description: `Memos for video ${videoId}`,
        videoId,
        userId: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Failed to create memos: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Memos creation response:', data);
    return data.id;
  } catch (error) {
    console.error('Error creating memos:', error);
    throw error;
  }
};