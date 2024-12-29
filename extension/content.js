console.log('Vemo 익스텐션 작동 중...');

let isOverlayActive = false; // 초기 상태는 비활성화

const observeThumbnails = () => {
    if (!isOverlayActive) return; // 비활성화 상태면 실행하지 않음
    console.log('observeThumbnails 실행 중');
    const observer = new MutationObserver(() => {
        document
            .querySelectorAll('a#thumbnail img.yt-core-image.yt-core-image--fill-parent-height')
            .forEach(thumbnail => {
                if (!thumbnail.classList.contains('vemo-processed')) {
                    thumbnail.classList.add('vemo-processed');
                    addOverlayToThumbnail(thumbnail);
                }
            });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
};

observeThumbnails();

const addOverlayToThumbnail = thumbnail => {
    if (!isOverlayActive) return; // 여기서 리턴해도 이벤트 리스너는 이미 추가되어 있음

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
        background-color: rgba(255, 255, 255, 0.4);
        transition: background-color 0.3s ease;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

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

    const triangleImg = document.createElement('div');
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

    const mouseenterHandler = () => {
        if (!isOverlayActive) return; // 비활성화 상태면 실행하지 않음
        if (!overlayDiv.contains(playButton)) {
            playButton.appendChild(triangleImg);
            overlayDiv.appendChild(playButton);
            thumbnail.parentElement.appendChild(overlayDiv);
        }
        thumbnail.style.transform = 'scale(1.3)';
        overlayDiv.style.backgroundColor = 'rgba(33, 148, 243, 0.2)';
    };

    const mouseleaveHandler = () => {
        if (!isOverlayActive) return; // 비활성화 상태면 실행하지 않음
        if (overlayDiv.contains(playButton)) playButton.remove();
        if (thumbnail.parentElement.contains(overlayDiv)) overlayDiv.remove();
        thumbnail.style.transform = 'scale(1)';
        overlayDiv.style.backgroundColor = 'transparent';
    };

    const clickHandler = e => {
        if (!isOverlayActive) return; // 비활성화 상태면 실행하지 않음
        e.preventDefault();
        window.location.href = 'http://52.78.136.69';
    };

    // 이벤트 리스너 추가
    thumbnail.addEventListener('mouseenter', mouseenterHandler);
    thumbnail.addEventListener('mouseleave', mouseleaveHandler);
    thumbnail.addEventListener('click', clickHandler);

    // 이벤트 핸들러 참조 저장
    thumbnail._vemoHandlers = {
        mouseenter: mouseenterHandler,
        mouseleave: mouseleaveHandler,
        click: clickHandler,
    };
};

let memoButton = null;
let overlay = null;

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
    if (!isOverlayActive) return; // 비활성화 상태면 실행하지 않음
    if (overlay) return;
    removeOverlay();

    overlay = document.createElement('div');
    overlay.className = 'vemo-overlay';

    document
        .querySelectorAll('a#thumbnail img.yt-core-image.yt-core-image--fill-parent-height')
        .forEach(thumbnail => {
            if (!thumbnail.classList.contains('vemo-processed')) {
                thumbnail.classList.add('vemo-processed');
                addOverlayToThumbnail(thumbnail);
            }
        });

    document.body.appendChild(overlay);
};

// 오버레이 제거
const removeOverlay = () => {
    if (overlay) overlay.remove();
    overlay = null;

    // 모든 썸네일에서 이벤트 리스너와 스타일 제거
    document.querySelectorAll('.vemo-processed').forEach(thumbnail => {
        // 저장된 이벤트 핸들러 제거
        if (thumbnail._vemoHandlers) {
            thumbnail.removeEventListener('mouseenter', thumbnail._vemoHandlers.mouseenter);
            thumbnail.removeEventListener('mouseleave', thumbnail._vemoHandlers.mouseleave);
            thumbnail.removeEventListener('click', thumbnail._vemoHandlers.click);
            delete thumbnail._vemoHandlers;
        }

        thumbnail.classList.remove('vemo-processed');
        thumbnail.style.transform = '';
        thumbnail.style.visibility = '';
        thumbnail.style.position = '';
        thumbnail.style.transition = '';
    });

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
        isOverlayActive = !isOverlayActive;
        console.log('isOverlayActive:', isOverlayActive);

        if (isOverlayActive) {
            observeThumbnails(); // MutationObserver 시작
            createOverlay(); // 활성화 시에만 오버레이 생성
        } else {
            removeOverlay(); // 비활성화 시 오버레이 제거
        }

        memoButton.textContent = isOverlayActive ? ' 닫기 ❌' : '📃영상 메모 바로가기';
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

// Message listener
chrome.runtime.onMessage.addListener(request => {
    if (request.action === 'toggleButton') {
        isOverlayActive = request.isEnabled;

        // 토글 상태와 관계없이 모든 기존 오버레이와 이벤트 리스너 제거
        removeOverlay();

        if (isOverlayActive) {
            // 활성화 상태일 때 메모 버튼과 오버레이 생성
            createMemoButton();
            isOverlayActive = false;
            createOverlay();
        } else {
            // 비활성화 상태일 때 메모 버튼 제거
            removeMemoButton();
        }
    }
});

// 저장된 상태 확인 후 버튼 생성
chrome.storage.sync.get(['isEnabled'], result => {
    if (result.isEnabled) {
        createMemoButton();
    }
});

// 초기 썸네일에 오버레이 적용
// if (isOverlayActive) {
//     createOverlay();
//     observeThumbnails();
// }
