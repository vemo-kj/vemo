import Link from "next/link";
import React from 'react';

type CreateButtonProps = {
  onSave: () => void;
  isLoading: boolean;
};

const CreateButton: React.FC<CreateButtonProps> = ({ onSave, isLoading }) => {
  return (
    <Link href="/mypage">
      <button
        onClick={onSave}
        disabled={isLoading}
      >
        저장
      </button>
    </Link>
  );
};

export default CreateButton;