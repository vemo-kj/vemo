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
        const token = getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log('Request headers:', headers);

        // createOrGetLatestMemos 엔드포인트로 요청
        const response = await fetch(`${API_URL}/home/memos/${videoId}`, {
            method: 'POST',
            headers,
            credentials: 'include' // 쿠키를 포함하여 요청
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Created/Retrieved memos:', data);
        
        // 전체 데이터를 반환
        return {
            memosId: data.id,
            title: data.title,
            createdAt: data.createdAt
        };
    } catch (error) {
        console.error('Error in createMemos:', error);
        throw error;
    }
};

// 사용자 로그인 처리를 위한 인터페이스
interface Credentials {
    username: string;
    password: string;
}

// 로그인 요청을 처리하는 함수
const handleLogin = async (credentials: Credentials) => {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();

        if (data.access_token) {
            setToken(data.access_token);
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
};

// Memo 관련 인터페이스 추가
interface CreateMemoData {
    timestamp: string;
    description: string;
    memosId: number;
}

interface UpdateMemoData {
    id: number;
    timestamp: string;
    description: string;
}

// Memo CRUD 함수들 추가
export const memoService = {
    createMemo: async (data: CreateMemoData) => {
        try {
            const requestData = {
                ...data,
                timestamp: new Date(data.timestamp),
                description: data.description || '',
            };

            const response = await fetch(`${API_URL}/memo`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to create memo:', error);
            throw error;
        }
    },

    updateMemo: async (data: UpdateMemoData) => {
        try {
            const requestData = {
                ...data,
                timestamp: new Date(data.timestamp),
                description: data.description || '',
            };

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

    deleteMemo: async (id: number) => {
        try {
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
