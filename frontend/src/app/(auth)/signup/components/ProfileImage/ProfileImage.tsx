'use client';
// next
import React, { useState } from 'react';
import Image from 'next/image';
// style
import styles from './ProfileImage.module.css';
// type
import { ProfileImageProps } from '../../../../types/ProfileImageProps';



export default function ProfileImage({
  id = 'profileImage',
  // 오류해결해야함
  // accept = 'image/*',
}: ProfileImageProps ): React.JSX.Element {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className={styles.ProfileImageContainer}>
      <div className={styles.previewContainer}>
        {previewUrl ? (
          <img src={previewUrl} alt="미리보기" className={styles.previewImage} />
        ) : (
          <div className={styles.emptyBox}>이미지를 선택하세요</div>
        )}
        {previewUrl && (
          
          <button
            className={styles.removeButton} 
            onClick={handleRemoveImage}>
            삭제
          </button>
        )}
        <label htmlFor={id}>{}</label>
      </div>
      
      <input
        type="file"
        id={id}
        accept='image/*'
        onChange={handleFileChange}
        className={styles.fileInput} />
    </div>
  );
}

