'use client';

import React, { useState, useEffect } from 'react';

const App = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    // "전체 화면 캡처"라고 쓰여 있지만 실제로는
    // content.js의 captureYouTubePlayer() 로직에서
    // "유튜브 iframe"만 잘라서 가져옴
    const handleCaptureTab = () => {
        window.postMessage({ type: 'CAPTURE_TAB' }, '*');
    };

    // 영역 선택 캡처
    const handleCaptureArea = () => {
        window.postMessage({ type: 'CAPTURE_AREA' }, '*');
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'CAPTURE_TAB_RESPONSE') {
                setImageSrc(event.data.dataUrl);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

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
                    (유튜브만) 캡처
                </button>
                <button onClick={handleCaptureArea}>영역 선택 캡처</button>
            </div>

            {imageSrc && (
                <div style={{ marginTop: '20px' }}>
                    <h3>캡처된 이미지:</h3>
                    <img
                        src={imageSrc}
                        alt="Captured"
                        style={{ maxWidth: '100%', border: '1px solid #ccc' }}
                    />
                </div>
            )}
        </div>
    );
};

export default App;
