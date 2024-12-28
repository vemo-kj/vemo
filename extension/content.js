console.log('Vemo 익스텐션 작동 중...');

let memoButton = null;
let overlay = null;
let isOverlayActive = false;

// 메모 추가 버튼 생성
const addMemoButton = () => {
    const controls = document.querySelector('#info #menu');
    if (controls && !document.querySelector('.memo-btn')) {
        const button = document.createElement('button');
        button.textContent = '메모 추가';
        button.className = 'memo-btn';
        button.style.marginLeft = '10px';
        button.onclick = () => alert('메모 기능 준비 중!');
        controls.appendChild(button);
    }
};

// 오버레이 생성
const createOverlay = () => {
    if (overlay) return;
    removeOverlay();

    overlay = document.createElement('div');
    overlay.className = 'vemo-overlay';

    document
        .querySelectorAll('a#thumbnail img.yt-core-image.yt-core-image--fill-parent-height')
        .forEach(thumbnail => {
            thumbnail.style.visibility = 'visible';
            thumbnail.style.position = 'relative';
            thumbnail.style.transition = 'transform 0.3s ease, filter 0.3s ease';

            const overlayDiv = document.createElement('div');
            overlayDiv.className = 'thumbnail-overlay';
            overlayDiv.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                pointer-events: none;
                background-color: rgba(255, 255, 255, 0.4);  /* 투명 배경 */
                transition: background-color 0.3s ease;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            // 중앙 재생 버튼 생성
            const playButton = document.createElement('div');
            playButton.style.cssText = `
                width: 70px;
                height: 70px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                cursor: pointer;
                transition: transform 0.2s ease;
                position: relative;
            `;

            // SVG 브이(V) 형태 수정
            const triangleImg = document.createElement('div');
            triangleImg.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            triangleImg.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="50" height="50" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#64B5F6" />
                            <stop offset="100%" stop-color="#2196F3" />
                        </linearGradient>
                    </defs>
                    <g transform="translate(50, 330) scale(0.8, -0.8)">
                        <path d="M44 295 c-15 -24 -14 -28 56 -150 66 -115 74 -125 100 -125 31 0 50 23 50 60 0 34 -119 220 -147 231 -35 13 -41 12 -59 -16z" fill="url(#gradient)"/>
                        <path d="M252 304 c-44 -30 -19 -114 34 -114 29 0 60 25 74 61 13 29 12 33 -9 50 -28 23 -69 24 -99 3z" fill="url(#gradient)"/>
                    </g>
                </svg>
            `;

            // 마우스 오버 시 썸네일 확대 및 오버레이 효과
            thumbnail.addEventListener('mouseenter', () => {
                // 중복 방지: 이미 추가된 경우 다시 추가하지 않음
                if (!overlayDiv.contains(playButton)) {
                    playButton.appendChild(triangleImg);
                    overlayDiv.appendChild(playButton);
                    thumbnail.parentElement.appendChild(overlayDiv);
                }

                thumbnail.style.transform = 'scale(1.3)';
                overlayDiv.style.backgroundColor = 'rgba(33, 148, 243, 0.3)';
            });

            // 마우스가 벗어나면 원래대로 복구
            thumbnail.addEventListener('mouseleave', () => {
                // 🔹 overlayDiv에서 재생 버튼 제거
                if (overlayDiv.contains(playButton)) {
                    playButton.remove();
                }

                // 🔹 오버레이 전체 제거
                if (thumbnail.parentElement.contains(overlayDiv)) {
                    overlayDiv.remove();
                }

                thumbnail.style.transform = 'scale(1)';
                overlayDiv.style.backgroundColor = 'transparent';
            });

            // 🔹 썸네일 클릭 시 페이지 이동
            thumbnail.addEventListener('click', e => {
                e.preventDefault(); // 기존 유튜브 링크 이동 방지
                window.location.href = 'http://52.78.136.69'; // 페이지 이동
            });
        });

    document.body.appendChild(overlay);

    // 오버레이 클릭 시 제거
    overlay.addEventListener('click', e => {
        if (e.target === overlay) removeOverlay();
    });
};

// 오버레이 제거
const removeOverlay = () => {
    if (overlay) overlay.remove();
    overlay = null;
    document.querySelectorAll('.thumbnail-overlay').forEach(el => el.remove());
};

// 메모 버튼 생성
const createMemoButton = () => {
    if (memoButton) return;

    memoButton = document.createElement('button');
    memoButton.textContent = '📃영상 메모 바로가기';
    memoButton.style.cssText = `
        font-size: 15px;
        font-weight: bold;
        position: fixed;
        right: 20px;
        bottom: 54px;
        z-index: 9999;
        padding: 10px 20px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;

    memoButton.addEventListener('mouseenter', () => (memoButton.style.backgroundColor = '#1976D2'));
    memoButton.addEventListener('mouseleave', () => (memoButton.style.backgroundColor = '#2196F3'));

    memoButton.addEventListener('click', () => {
        isOverlayActive ? removeOverlay() : createOverlay();
        memoButton.textContent = isOverlayActive ? '📃영상 메모 바로가기' : ' 닫기 ❌';
        isOverlayActive = !isOverlayActive;
        console.log('isOverlayActive:', isOverlayActive);
    });

    document.body.appendChild(memoButton);
};

// 메모 버튼 제거
const removeMemoButton = () => {
    if (memoButton) memoButton.remove();
    memoButton = null;
    removeOverlay();
};

// MutationObserver로 SPA 감지해 버튼 재생성
const observer = new MutationObserver(addMemoButton);
observer.observe(document.body, { childList: true, subtree: true });

addMemoButton();

// 메시지 수신으로 버튼 토글
chrome.runtime.onMessage.addListener(request => {
    if (request.action === 'toggleButton') {
        request.isEnabled ? createMemoButton() : removeMemoButton();
    }
});

// 저장된 상태 확인 후 버튼 생성
chrome.storage.sync.get(['isEnabled'], result => {
    if (result.isEnabled) createMemoButton();
});
