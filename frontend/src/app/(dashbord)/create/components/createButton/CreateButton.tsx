import Link from "next/link";
import React from 'react';
//style
import styles from './CreateButton.module.css';

type CreateButtonProps = {
  onSave: () => void;
  isLoading: boolean;
};

const CreateButton: React.FC<CreateButtonProps> = ({ onSave, isLoading }) => {
  return (
    <Link href="/" className={styles.createButtonContainer}>
      <button
        className={styles.createButton}
        onClick={onSave}
        disabled={isLoading}
      >
        저장
      </button>
    </Link>
  );
};

export default CreateButton;

