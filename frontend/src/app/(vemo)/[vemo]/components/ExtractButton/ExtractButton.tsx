import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

export default function OCRExtract() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // 이미지 선택 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  // OCR 추출 핸들러
  const handleExtractText = () => {
    if (!selectedImage) {
      alert('이미지를 선택해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        // 다중 언어 설정 ('eng+kor')
        Tesseract.recognize(reader.result as string, 'eng+kor', {
          logger: (info) => {
            if (info.status === 'recognizing text') {
              setProgress(info.progress * 100);
            }
          },
        })
          .then(({ data: { text } }) => {
            setExtractedText(text); // 추출된 텍스트 저장
            setProgress(100);
          })
          .catch((error) => {
            console.error('OCR 오류:', error);
            alert('텍스트 추출 중 오류가 발생했습니다.');
          });
      }
    };
    reader.readAsDataURL(selectedImage);
  };

  return (
    <div>
      <h2>이미지에서 텍스트 추출 (한글 + 영어)</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleExtractText}>텍스트 추출</button>
      {progress > 0 && progress < 100 && <p>진행률: {Math.round(progress)}%</p>}
      {extractedText && (
        <div>
          <h3>추출된 텍스트:</h3>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
}
// 이거.. 백에서 처리하는게 베스트일거 같은데..
