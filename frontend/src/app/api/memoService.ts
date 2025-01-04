// memoService.ts

// (중요) NEXT_PUBLIC_API_URL = e.g. "http://localhost:5050"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
console.log('Using API URL:', API_URL);

// 인증 헤더 생성 (토큰 사용 시)
const getAuthHeader = () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  console.log('Using token:', token);
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// --------------------------------------
// (기존) 메모 생성 API 호출 예시
// --------------------------------------
export const createMemos = async (videoId: string) => {
  try {
    console.log('Creating memos with videoId:', videoId);

    // (1) POST 요청 (백엔드 라우팅이 '/memos'이면 URL도 '/memos')
    const response = await fetch(`${API_URL}/home/memos`, {
      method: 'POST',
      headers: getAuthHeader(),
      // (2) body에 title, description, videoId, userId(?) 등
      body: JSON.stringify({
        title: 'New Memo',
        description: `Memos for video ${videoId}`,
        videoId: videoId, // videoId
        userId: 1,        // 예시: 임의의 userId (실제로는 로그인 유저 id)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Failed to create memos: ${response.statusText}`);
    }

    // (3) 서버 응답에서 data (생성된 memos 엔티티) 파싱
    const data = await response.json();
    console.log('Server response:', data);

    // (4) 백엔드가 { id: 123, title: "...", ... } 형태를 반환한다고 가정
    // 여기서 id만 리턴
    return data.id;
  } catch (error) {
    console.error('Error creating memos:', error);
    throw error;
  }
};

// ---------------------------------------
// (기존) 메모 조회 API 호출 예시
// ---------------------------------------
export const getMemosByVideoId = async (videoId: string) => {
  try {
    const response = await fetch(`${API_URL}/vemo/community-memos/${videoId}?filter=mine`, {
      headers: getAuthHeader(),
    });

    if (response.status === 404) {
      return null; // 없으면 null
    }

    if (!response.ok) {
      throw new Error(`Failed to get memos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.memos[0] || null;
  } catch (error) {
    console.error('Error getting memos:', error);
    return null;
  }
};