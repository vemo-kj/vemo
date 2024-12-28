import React, { useState, ChangeEvent, FocusEvent } from 'react';
import styles from './editor.module.css';

interface MomoItemProps {
    timestamp: string; // 타임스탬프는 문자열 형식입니다.
    content: string;
    // [추가] 캡처 이미지를 저장할 수 있는 필드
    onTiemstampClick?: (timestamp: string) => void;
    // [추가] 메모 수정 시 호출할 함수

    onSave: (newContent: string) => void; // 수정 완료 시 부모에게 알려주는 콜백
    onDelete: () => void; // 삭제 시 부모에게 알려주는 콜백
}

export function MomoItem({
    timestamp,
    content,
    onTiemstampClick,
    onSave,
    onDelete,
}: MomoItemProps) {
    // 수정 모드인지 여부 : 수정 모드는 더블 클릭시 활성화
    const [isEditing, setIsEditing] = useState(false);
    const [tempContent, setTempContent] = useState(content);
}
