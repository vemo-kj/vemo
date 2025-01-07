import React from 'react';

interface CaptureButtonProps {
    // These callbacks should eventually trigger image capture and processing
    onCaptureTab: () => void;    // Handles full tab capture
    onCaptureArea: () => void;   // Handles partial area capture
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ onCaptureTab, onCaptureArea }) => {
    // Consider adding loading state to disable buttons during capture
    // const [isCapturing, setIsCapturing] = useState(false);

    return (
        <div style={{ marginBottom: '10px' }}>
            <button
                onClick={onCaptureTab}
                style={{ marginRight: '10px' }}
            // disabled={isCapturing}
            >
                캡처하기
            </button>
            <button
                onClick={onCaptureArea}
            // disabled={isCapturing}
            >
                부분캡처
            </button>
        </div>
    );
};

export default CaptureButton;
