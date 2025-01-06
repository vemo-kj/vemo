// memoService.ts
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
        const token = getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };

        console.log('Request headers:', headers);

        // [수정됨] 경로: POST http://localhost:5050/home/memos/:videoId
        const response = await fetch(`${API_URL}/home/memos/${videoId}`, {
            method: 'POST',
            headers,
            credentials: 'include', // 쿠키 포함
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Created/Retrieved memos:', data);

        // 백엔드에서 { id, title, createdAt, ... } 형태로 반환한다고 가정
        return {
            memosId: data.id,
            title: data.title,
            createdAt: data.createdAt,
        };
    } catch (error) {
        console.error('Error in createMemos:', error);
        throw error;
    }
};

// 사용자 로그인 처리를 위한 예시 함수
interface Credentials {
    username: string;
    password: string;
}
export const handleLogin = async (credentials: Credentials) => {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

// ----------------------------------------------------------------
// (2) Memo 아이템 CRUD (백엔드: /memo)
// ----------------------------------------------------------------
interface CreateMemoData {
    timestamp: string;    // 유튜브 재생 시간
    description: string;
    memosId: number;
}
interface UpdateMemoData {
    id: number;
    description: string;
    timestamp?: string;  // optional로 변경
}

export const memoService = {
    // 생성
    async createMemo(data: CreateMemoData) {
        try {
            // 타임스탬프 형식 검증
            if (!data.timestamp.match(/^\d{2}:\d{2}$/)) {
                throw new Error('Invalid timestamp format. Expected format: MM:SS');
            }

            const requestData = {
                timestamp: data.timestamp,
                description: data.description || '',
                memosId: data.memosId,
            };

            console.log('Sending memo data:', requestData);

            const response = await fetch(`${API_URL}/memo`, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.message || 'Failed to create memo');
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
                id: data.id,
                description: data.description, // id는 URL로 전달되므로 제거
            };
    
            console.log(`Updating memo with ID: ${data.id}, Data:`, requestData);
    
            // URL에 id 포함
            const response = await fetch(`${API_URL}/memo/${data.id}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
    
            // 응답 상태 확인
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Failed to update memo:', errorData);
                throw new Error(
                    errorData?.message || `HTTP error! status: ${response.status}`
                );
            }
    
            // 백엔드가 응답 본문을 제공하는 경우만 JSON 파싱
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
    
            // 응답 본문이 없는 경우 처리
            return { message: 'Memo updated successfully' };
        } catch (error) {
            console.error('Error in updateMemo:', error);
            throw error;
        }
    },

    // 삭제
    async deleteMemo(id: number) {
        const response = await fetch(`${API_URL}/memo/${id}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      
       // 백엔드가 body를 전혀 반환하지 않는 경우, 200/204라면 굳이 JSON 파싱 안 함
       if (response.status === 204) {
         // 서버가 204 No Content로 응답했다고 가정
         return { message: 'No Content' };
       }
       // 혹은 200 OK지만 body가 빈 문자열일 수도 있으니 text()로 판별
       const text = await response.text();
       if (!text) {
         // 정말 빈 문자열인 경우
         return { message: 'Deleted (no body)' };
       }
      
       // body가 있다면 JSON 파싱
       try {
         return JSON.parse(text);
       } catch {
         return { message: 'Deleted (invalid JSON body)' };
       }
      }
};