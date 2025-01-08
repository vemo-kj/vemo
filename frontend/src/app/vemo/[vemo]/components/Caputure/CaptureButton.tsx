import React from 'react';
import styles from './CaptureButton.module.css';

interface CaptureButtonProps {
    onCaptureTab: () => void;    // 유튜브 플레이어 영역 캡처
    onCaptureArea: () => void;   // 사용자 선택 영역 캡처
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ onCaptureTab, onCaptureArea }) => {
    return (
        <div className={styles.captureButtonContainer}>
            <button
                onClick={onCaptureTab}
                className={styles.captureButton}
                title="유튜브 플레이어 영역을 캡처합니다"
            >
                플레이어 캡처
            </button>
            <button
                onClick={onCaptureArea}
                className={`${styles.captureButton} ${styles.areaButton}`}
                title="원하는 영역을 직접 선택하여 캡처합니다"
            >
                영역 선택
            </button>
        </div>
    );
};

export default CaptureButton;
