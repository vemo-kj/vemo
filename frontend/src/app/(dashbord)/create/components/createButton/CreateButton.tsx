import Link from "next/link";
import React from 'react';

type CreateButtonProps = {
  onSave: () => void;
};

const CreateButton: React.FC<CreateButtonProps> = ({ onSave }) => {
  return (
    <Link href="/mypage">
      <button
        onClick={onSave}
      >
        저장
      </button>
    </Link>
  );
};

export default CreateButton;