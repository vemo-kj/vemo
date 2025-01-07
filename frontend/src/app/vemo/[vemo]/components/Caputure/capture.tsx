import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import styles from './Capture.module.css';

interface CaptureComponentProps {
    onCapture: (timestamp: string, imageUrl: string) => void;
    currentTimestamp: string;
    targetRef: React.RefObject<HTMLElement>;
}

export default function CaptureComponent({ onCapture, currentTimestamp, targetRef }: CaptureComponentProps) {
    const [isCapturing, setIsCapturing] = useState<boolean>(false);
    const [captureError, setCaptureError] = useState<string | null>(null);

    const handleCapture = async () => {
        if (!targetRef.current) {
            console.error('캡처할 대상을 찾을 수 없습니다.');
            return;
        }

        setIsCapturing(true);
        setCaptureError(null);

        try {
            const options = {
                quality: 0.95,
                cacheBust: true,
            };

            const dataUrl = await toPng(targetRef.current, options);
            onCapture(currentTimestamp, dataUrl);
        } catch (error) {
            console.error('캡처 중 오류 발생:', error);
            setCaptureError(`캡처 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className={styles.captureControls}>
            <button
                onClick={handleCapture}
                disabled={isCapturing}
                className={styles.captureButton}
            >
                {isCapturing ? '캡처 중...' : '화면 캡처'}
            </button>
            {captureError && (
                <div className={styles.error}>
                    {captureError}
                </div>
            )}
        </div>
    );
}
