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
        const token = localStorage.getItem('token');
        console.log('=== Request Details ===');
        console.log('API URL:', `${API_URL}/home/memos/video/${videoId}`);
        console.log('Token:', token);

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // JWT 토큰이 있다면 Authorization 헤더에 추가
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/home/memos/video/${videoId}`, {
            method: 'POST',
            headers: headers,
            credentials: 'include', // 쿠키도 함께 전송
        });

        console.log('=== Response Details ===');
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers));

        if (!response.ok) {
            const errorData = await response.json();
            console.log('Error Response:', errorData);

            if (response.status === 401) {
                throw new Error('Authentication failed');
            }
            throw new Error(errorData.message || 'Failed to create memos');
        }

        const data = await response.json();
        console.log('Success Response:', data);
        return data;
    } catch (error) {
        console.error('Error in createMemos:', error);
        throw error;
    }
};
