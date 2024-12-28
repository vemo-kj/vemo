'use client'; // 클라이언트 컴포넌트로 명시

import React, { useState } from 'react';

const App = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const handleCaptureTab = () => {
        chrome.runtime.sendMessage({ action: 'captureTab' }, response => {
            if (response?.dataUrl) {
                setImageSrc(response.dataUrl); // 캡처된 이미지 저장
            }
        });
    };

    const handleCaptureArea = () => {
        chrome.runtime.sendMessage({ action: 'captureArea' });
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>화면 캡처 데모</h1>

            <iframe
                id="youtube-player"
                width="560"
                height="315"
                src="https://www.youtube.com/embed/4inx3YuY_hI?enablejsapi=1"
                title="YouTube Video Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>

            <div style={{ marginTop: '20px' }}>
                <button onClick={handleCaptureTab} style={{ marginRight: '10px' }}>
                    전체 화면 캡처
                </button>
                <button onClick={handleCaptureArea}>영역 선택 캡처</button>
            </div>

            {imageSrc && (
                <div style={{ marginTop: '20px' }}>
                    <h3>캡처된 이미지:</h3>
                    <img src={imageSrc} alt="Captured" style={{ maxWidth: '100%' }} />
                </div>
            )}
        </div>
    );
};

export default App;
