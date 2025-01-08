import React from 'react';
import { VideoResponse } from '@/app/types/VideoResponse';
import styles from './CreateButton.module.css';

type CreateButtonProps = {
  onSave: () => Promise<void>;
  isLoading: boolean;
};

const CreateButton: React.FC<CreateButtonProps> = ({ onSave, isLoading }) => {
  const handleClick = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
    }
  };

  return (
    <div className={styles.createButtonContainer}>
      <button
        className={styles.createButton}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? "저장 중..." : "저장"}
      </button>
    </div>
  );
};

export default CreateButton;