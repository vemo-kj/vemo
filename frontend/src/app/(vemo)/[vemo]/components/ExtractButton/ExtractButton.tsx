import React, { useState } from 'react';

export default function ExtractButton() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleExtractText = async () => {
    if (!selectedImage) {
      alert('이미지를 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('텍스트 추출에 실패했습니다.');
      }

      const data = await response.json();
      setExtractedText(data.text);
    } catch (error) {
      console.error('텍스트 추출 오류:', error);
      alert('텍스트 추출 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleExtractText}>추출하기</button>
      {extractedText && (
        <div>
          <h3>추출된 텍스트:</h3>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
}