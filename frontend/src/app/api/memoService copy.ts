// [수정됨] Next.js 13의 /api/memo, /api/memos로 요청을 보내고,
// Next 라우트에서 NestJS로 재전달하도록 함.
import axios from 'axios';

interface CreateMemoParams {
  timestamp: string;
  description: string;
  memosId: number;
}

interface CreateMemosParams {
  title: string;
  description: string;
  videoId: string;
  userId: number;
}

interface MemoResponse {
  id: number;
  timestamp: Date;
  description: string;
  memosId: number;
}

interface MemosResponse {
  id: number;
  title: string;
  description: string;
  videoId: string;
  userId: number;
}

export const memoService = {
  // 개별 메모 생성
  createMemo: async ({ timestamp, description, memosId }: CreateMemoParams): Promise<MemoResponse> => {
    try {
      // [수정됨] '/api/memo' 라우트 → Next.js route.ts (프록시) → NestJS
      const response = await axios.post('/api/memo', {
        timestamp,
        description,
        memosId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // memos 생성 (비디오별 메모 컨테이너)
  createMemos: async ({ title, description, videoId, userId }: CreateMemosParams): Promise<MemosResponse> => {
    try {
      // [수정됨] '/api/memos' 라우트 → Next.js → NestJS
      const response = await axios.post('/api/memos', {
        title,
        description,
        videoId,
        userId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 비디오의 모든 메모 조회
  getMemosByVideo: async (videoId: string): Promise<MemoResponse[]> => {
    try {
      const response = await axios.get(`/api/memos/${videoId}/memos`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch memos:', error);
      throw error;
    }
  },
};