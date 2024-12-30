import React from 'react';

interface CaptureButtonProps {
    onCaptureTab: () => void;
    onCaptureArea: () => void;
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ onCaptureTab, onCaptureArea }) => {
    return (
        <div style={{ marginBottom: '10px' }}>
            <button onClick={onCaptureTab} style={{ marginRight: '10px' }}>
                캡처하기
            </button>
            <button onClick={onCaptureArea}>부분캡처</button>
        </div>
    );
};

export default CaptureButton;
