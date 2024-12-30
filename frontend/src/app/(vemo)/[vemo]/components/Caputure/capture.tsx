import React, { useRef } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import styles from './Capture.module.css'; // 스타일 정의

export default function CaptureComponent() {
    const captureRef = useRef<HTMLDivElement | null>(null); // 캡처할 영역 참조
    const selectionRef = useRef<HTMLDivElement | null>(null); // 선택된 영역 참조

    // 전체 캡처
    const handleFullCapture = async () => {
        if (!captureRef.current) return;
        try {
            const dataUrl = await toPng(captureRef.current); // 캡처된 이미지를 Data URL로 변환
            downloadImage(dataUrl, 'full-capture.png');
        } catch (error) {
            console.error('캡처 중 오류 발생:', error);
        }
    };

    // 선택된 부분 캡처
    const handlePartialCapture = async () => {
        if (!selectionRef.current) return;
        try {
            const dataUrl = await toPng(selectionRef.current);
            downloadImage(dataUrl, 'partial-capture.png');
        } catch (error) {
            console.error('부분 캡처 중 오류 발생:', error);
        }
    };

    // 이미지 다운로드
    const downloadImage = (dataUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div ref={captureRef} className={styles.captureArea}>
                <h1>캡처할 영역</h1>
                <p>이 영역 전체를 캡처하거나 선택한 부분만 캡처할 수 있습니다.</p>
                <div ref={selectionRef} className={styles.selectionArea}>
                    <p>부분 캡처할 영역</p>
                </div>
            </div>

            <div className={styles.buttons}>
                <button onClick={handleFullCapture}>전체 캡처</button>
                <button onClick={handlePartialCapture}>부분 캡처</button>
            </div>
        </div>
    );
}
