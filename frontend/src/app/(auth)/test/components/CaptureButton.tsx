import React from 'react';

interface CaptureButtonProps {
    onCaptureTab: () => void;
    onCaptureArea: () => void;
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ onCaptureTab, onCaptureArea }) => {
    return (
        <div>
            <button onClick={onCaptureTab} style={{ marginRight: '10px' }}>
                전체 화면 캡처
            </button>
            <button onClick={onCaptureArea}>영역 선택 캡처</button>
        </div>
    );
};

export default CaptureButton;
