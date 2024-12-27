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
                background-color: rgba(33, 148, 243, 0.5);
                z-index: 10;
                pointer-events: none;
                transition: background-color 0.3s ease;
                border : 3px solid white;
            `;

            thumbnail.parentElement.appendChild(overlayDiv);

            // 마우스 오버 시 썸네일 확대 및 테두리 추가
            thumbnail.addEventListener('mouseenter', () => {
                thumbnail.style.transform = 'scale(2)';
                overlayDiv.style.backgroundColor = 'rgba(33, 148, 243, 0.8)';
            });

            // 마우스가 벗어나면 원래대로 복구
            thumbnail.addEventListener('mouseleave', () => {
                thumbnail.style.transform = 'scale(1)';
                overlayDiv.style.backgroundColor = 'rgba(33, 148, 243, 0.3)';
            });
        });

    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) removeOverlay();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') removeOverlay();
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
    memoButton.textContent = '영상 메모 바로가기';
    memoButton.style.cssText = `
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
        memoButton.textContent = isOverlayActive ? '영상 메모 바로가기' : '바로가기 끄기';
        isOverlayActive = !isOverlayActive;
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
