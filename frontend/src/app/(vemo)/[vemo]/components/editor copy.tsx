import React, { useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import styles from './Editor.module.css'; // 스타일 모듈

const QuillEditor = () => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [sections, setSections] = useState<{ timestamp: string; content: string }[]>([]);

    // 현재 시간을 타임스탬프로 반환
    const getTimestamp = () => '00:01';

    const handleSave = () => {
        if (editorRef.current) {
            const quill = new Quill(editorRef.current);
            const content = quill.getText().trim(); // Quill 텍스트 가져오기
            if (content) {
                setSections(prev => [...prev, { timestamp: getTimestamp(), content }]);
                quill.setText(''); // 에디터 초기화
            }
        }
    };

    return (
        <div className={styles.editorContainer}>
            <div className={styles.editorWrapper}>
                <div ref={editorRef} className={styles.quillEditor}></div>
                <div className={styles.editorToolbar}>
                    <span className={styles.timestamp}>{getTimestamp()}</span>
                    <button className={styles.addButton} onClick={handleSave}>
                        +
                    </button>
                </div>
            </div>

            {/* 저장된 섹션 */}
            <div className={styles.savedSections}>
                {sections.map((section, index) => (
                    <div key={index} className={styles.savedSection}>
                        <span className={styles.timestamp}>{section.timestamp}</span>
                        <span className={styles.sectionContent}>{section.content}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuillEditor;
