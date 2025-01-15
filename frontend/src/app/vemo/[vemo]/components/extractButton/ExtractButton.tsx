'use client';

import { useState } from 'react';
import styles from './ExtractButton.module.css';

interface ExtractButtonProps {
    imageUrl: string;
    onExtracted: (text: string) => void;
    onDelete: () => void;
}

const ResultModal = ({ text, onUse, onCancel, isOpen }: {
    text: string;
    onUse: () => void;
    onCancel: () => void;
    isOpen: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>추출된 텍스트</h2>
                <div className={styles.modalContent}>
                    <p>{text}</p>
                </div>
                <div className={styles.modalActions}>
                    <button onClick={onUse} className={styles.useButton}>
                        사용하기
                    </button>
                    <button onClick={onCancel} className={styles.cancelButton}>
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ExtractButton({ imageUrl, onExtracted, onDelete }: ExtractButtonProps) {
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleExtractText = async () => {
        try {
            console.log('Extract button clicked, imageUrl:', imageUrl);
            setIsExtracting(true);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/text-extraction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                setExtractedText(data.text);
                setIsModalOpen(true);
            } else {
                throw new Error(data.error || '텍스트 추출에 실패했습니다.');
            }
        } catch (error) {
            console.error('텍스트 추출 실패:', error);
            alert('텍스트 추출에 실패했습니다.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleUseText = () => {
        onExtracted(extractedText);
        onDelete();
        setIsModalOpen(false);
        setExtractedText('');
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setExtractedText('');
    };

    return (
        <>
            <button
                className={styles.extractBtn}
                onClick={handleExtractText}
                disabled={isExtracting}
                aria-label={isExtracting ? '추출 중...' : '추출하기'}
            />

            <ResultModal
                text={extractedText}
                onUse={handleUseText}
                onCancel={handleCancel}
                isOpen={isModalOpen}
            />
        </>
    );
}
