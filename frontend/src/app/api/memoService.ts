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
        Authorization: `Bearer ${token}`,
    };
};

// --------------------------------------
// (기존) 메모 생성 API 호출 예시
// --------------------------------------
export const createMemos = async (videoId: string) => {
    try {
        const token = sessionStorage.getItem('token');
        console.log('Token:', token); // 토큰 확인용

        if (!token) {
            throw new Error('No authentication token found');
        }

        // 임시 userId (실제로는 로그인한 사용자의 ID를 사용해야 함)
        const userId = 1;
        const response = await fetch(`${API_URL}/home/memos/video/${videoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        console.log('Full response:', response);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error details:', errorData);
            throw new Error(`Failed to create memos: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in createMemos:', error);
        throw error;
    }
};

// ---------------------------------------
// (기존) 메모 조회 API 호출 예시
// ---------------------------------------
export const getMemosByVideoId = async (memosId: number) => {
    try {
        const response = await fetch(`${API_URL}/memos/${memosId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch memos: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching memos:', error);
        throw error;
    }
};
