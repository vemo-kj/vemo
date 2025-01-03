// [수정됨] timestamp → toISOString()으로 전달, 응답은 .json()으로 파싱
export const memoService = {
    // 메모 생성
    async create(memo: { timestamp: Date; htmlContent: string }) {
      try {
        const sanitizedHtml = memo.htmlContent
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
  
        const response = await fetch('/api/memos', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // [수정됨] timestamp.toISOString()으로 직렬화
          body: JSON.stringify({
            timestamp: memo.timestamp.toISOString(),
            htmlContent: sanitizedHtml
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Server response:', response.status, errorData);
          throw new Error(`Failed to create memo: ${response.status} ${errorData}`);
        }
        return response.json(); // JSON으로 반환
      } catch (error) {
        console.error('Create memo failed:', error);
        throw error;
      }
    },
  
    // 메모 업데이트
    async update(memo: { id: number; htmlContent: string; timestamp: string }) {
      try {
        const sanitizedHtml = memo.htmlContent
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
  
        const response = await fetch(`/api/memos/${memo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...memo,
            htmlContent: sanitizedHtml,
            // [수정됨] 이미 문자열 형태로 들어온 timestamp 사용
          }),
        });
  
        if (!response.ok) {
          console.error('Error updating memo:', response.status, response.statusText);
          throw new Error(`Failed to update memo: ${response.statusText}`);
        }
  
        return response.json();
      } catch (error) {
        console.error('Update memo failed:', error);
        throw error;
      }
    },
  
    // 메모 삭제
    async delete(id: number) {
      try {
        const response = await fetch(`/api/memos/${id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          console.error('Error deleting memo:', response.status, response.statusText);
          throw new Error(`Failed to delete memo: ${response.statusText}`);
        }
  
        return response.json();
      } catch (error) {
        console.error('Delete memo failed:', error);
        throw error;
      }
    },
  };