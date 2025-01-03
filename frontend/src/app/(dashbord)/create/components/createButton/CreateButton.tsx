// import Link from "next/link";
// import React from 'react';
// //style
// import styles from './CreateButton.module.css';

// type CreateButtonProps = {
//   onSave: () => void;
//   isLoading: boolean;
//   responseData: { playlistId: number; videoId: string; videoIndex: number }[] | null;
// };

// const CreateButton: React.FC<CreateButtonProps> = ({ onSave, isLoading }) => {
//   return (
//     <Link href="/" className={styles.createButtonContainer}>
//       <button
//         className={styles.createButton}
//         onClick={onSave}
//         disabled={isLoading}
//       >
//         저장
//       </button>
//     </Link>
//   );
// };

// export default CreateButton;

// src/app/(dashbord)/create/components/createButton/CreateButton.tsx

// src/app/(dashbord)/create/components/createButton/CreateButton.tsx

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
    <Link href="/" className={styles.createButtonContainer}>
      <button
        className={styles.createButton}
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? "저장 중..." : "저장"}
      </button>
    </div>
  );
};

export default CreateButton;