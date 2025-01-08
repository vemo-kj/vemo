// 메모 생성 응답 DTO
export interface CreateMemosResponseDto {
  id: number;
  title: string;
  createdAt: Date;
  memo: MemoItem[];
  captures: CaptureItem[];
}

// 메모 아이템 인터페이스
export interface MemoItem {
    id: number;
    timestamp: string;
    description: string;
}

// 캡처 아이템 인터페이스
export interface CaptureItem {
    id: number;
    timestamp: string;
    image: string;
}

// 에디터 props 인터페이스
export interface CustomEditorProps {
    ref?: React.Ref<unknown>;
    getTimestamp: () => string;
    onTimestampClick: (timestamp: string) => void;
    isEditable?: boolean;
    editingItemId?: string | null;
    onEditStart?: (itemId: string) => void;
    onEditEnd?: () => void;
    onPauseVideo?: () => void;
    videoId?: string;
    onMemoSaved?: () => void;
}

// 페이지 props 인터페이스
export interface PageProps {
    params: {
        vemo: string;
    };
}
