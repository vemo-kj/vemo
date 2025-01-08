'use client';

import { useState } from 'react';
import styles from './ExtractButton.module.css';

interface ResultModalProps {
  text: string;
  onUse: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ResultModal = ({ text, onUse, onCancel, isOpen }: ResultModalProps) => {
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

export default function ExtractButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExtractText = async (imageBase64: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5050/text-extraction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '텍스트 추출에 실패했습니다.');
      }

      setExtractedText(data.text);
      setIsModalOpen(true); // 추출 성공시 모달 열기
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await convertImageToBase64(file);
      await handleExtractText(base64);
    } catch (err) {
      setError('이미지 처리 중 오류가 발생했습니다.');
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('이미지 변환에 실패했습니다.'));
        }
      };
      reader.onerror = () => reject(new Error('이미지 읽기에 실패했습니다.'));
      reader.readAsDataURL(file);
    });
  };

  const handleUseText = () => {
    // TODO: 추출된 텍스트를 사용하는 로직 구현
    // 예: 에디터에 텍스트 추가
    setIsModalOpen(false);
    setExtractedText('');
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setExtractedText('');
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        id="image-upload"
      />
      <label htmlFor="image-upload" className={styles.button}>
        {isLoading ? '처리 중...' : '추출하기'}
      </label>

      {error && <div className={styles.error}>{error}</div>}

      <ResultModal
        text={extractedText}
        onUse={handleUseText}
        onCancel={handleCancel}
        isOpen={isModalOpen}
      />
    </div>
  );
}
