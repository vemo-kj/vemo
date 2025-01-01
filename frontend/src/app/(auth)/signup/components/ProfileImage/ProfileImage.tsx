'use client';
// next
import React, { useState } from 'react';
import Image from 'next/image';
// style
import styles from './ProfileImage.module.css';
// type


interface ProfileImageProps {
  onImageSelect: (image: File | null) => void;
}

export default function ProfileImage({ onImageSelect }: ProfileImageProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageSelect(file); // 선택한 이미지를 상위 컴포넌트로 전달
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    onImageSelect(null); // 상위 컴포넌트에서 이미지 제거
    setPreviewUrl(null);
  };

  return (
    <div>
      <div>
        {previewUrl ? (
          <img src={previewUrl} alt="미리보기" />
        ) : (
          <div>이미지를 선택하세요</div>
        )}
        {previewUrl && <button onClick={handleRemoveImage}>삭제</button>}
      </div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
