console.log('Vemo 익스텐션 작동 중...');

// 메모 버튼 전역 변수
let memoButton = null;
let overlay = null;

// 유튜브 컨트롤에 메모 추가 버튼 생성
const addMemoButton = () => {
    const controls = document.querySelector('#info #menu');
    if (controls && !document.querySelector('.memo-btn')) {
        const button = document.createElement('button');
        button.textContent = '메모 추가';
        button.className = 'memo-btn';
        button.style.marginLeft = '10px';
        button.onclick = () => {
            alert('메모 기능 준비 중!');
        };
        controls.appendChild(button);
    }
};

// 페이지가 로드될 때 메모 추가 버튼 생성
addMemoButton();

// 유튜브 SPA(Single Page Application) 전환 감지 → 버튼 재생성
const observer = new MutationObserver(() => {
    addMemoButton();
});
observer.observe(document.body, { childList: true, subtree: true });

// 메모 오버레이 생성 함수
function createOverlay() {
    console.log('Creating overlay'); // 디버깅 로그
    if (overlay) return;

    // 기존 오버레이 제거
    if (document.querySelector('.vemo-overlay')) {
        document.querySelector('.vemo-overlay').remove();
    }

    overlay = document.createElement('div');
    overlay.className = 'vemo-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 99999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    // 모든 썸네일 선택
    const thumbnails = document.querySelectorAll(
        'img.yt-core-image.yt-core-image--fill-parent-height.yt-core-image--fill-parent-width',
    );

    // 썸네일 스타일 조정 및 오버레이 추가
    thumbnails.forEach(thumbnail => {
        // 썸네일을 보이게 설정
        thumbnail.style.visibility = 'visible';
        thumbnail.style.position = 'relative';

        // 오버레이 생성
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // 빨간 반투명
        overlay.style.zIndex = '10';
        overlay.style.pointerEvents = 'none'; // 클릭 방지 X

        // 오버레이 추가
        thumbnail.parentElement.appendChild(overlay);
    });

    // const memoContainer = document.createElement('div');
    // memoContainer.className = 'vemo-container';
    // memoContainer.style.cssText = `
    //     position: relative;
    //     background-color: white;
    //     padding: 20px;
    //     border-radius: 8px;
    //     width: 80%;
    //     max-width: 600px;
    //     max-height: 80vh;
    //     overflow-y: auto;
    // `;

    // // 메모 컨텐츠 추가
    // const content = document.createElement('div');
    // content.innerHTML = `
    //     <h2 style="margin-bottom: 20px;">영상 메모</h2>
    //     <textarea style="width: 100%; height: 200px; margin-bottom: 20px; padding: 10px;"></textarea>
    //     <button style="padding: 10px 20px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">저장</button>
    // `;
    // memoContainer.appendChild(content);

    // // 오버레이 닫기 버튼
    // const closeButton = document.createElement('button');
    // closeButton.textContent = '✕';
    // closeButton.style.cssText = `
    //     position: absolute;
    //     top: 10px;
    //     right: 10px;
    //     padding: 5px 10px;
    //     background: none;
    //     border: none;
    //     font-size: 20px;
    //     cursor: pointer;
    //     color: #666;
    // `;

    closeButton.addEventListener('click', () => {
        overlay.remove();
        overlay = null;
    });

    thumbnail.appendChild(closeButton);
    overlay.appendChild(thumbnail);
    document.body.appendChild(overlay);

    // ESC 키로 오버레이 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay) {
            overlay.remove();
            overlay = null;
        }
    });

    // 오버레이 외부 클릭시 닫기
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.remove();
            overlay = null;
        }
    });
}

// 메모 바로가기 버튼 생성 함수
function createMemoButton() {
    console.log('Creating memo button'); // 디버깅 로그
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
        transition: background-color 0.3s ease;
    `;

    // 호버링 이벤트 추가
    memoButton.addEventListener('mouseenter', function () {
        memoButton.style.backgroundColor = '#1976D2';
    });

    memoButton.addEventListener('mouseleave', function () {
        memoButton.style.backgroundColor = '#2196F3';
    });

    memoButton.addEventListener('click', function () {
        createOverlay();
    });

    document.body.appendChild(memoButton);
}

// 메모 바로가기 버튼 제거 함수
function removeMemoButton() {
    if (memoButton) {
        memoButton.remove();
        memoButton = null;
    }
    if (overlay) {
        overlay.remove();
        overlay = null;
    }
}

// 백그라운드에서 메시지 수신 및 버튼 토글
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Message received:', request); // 디버깅 로그
    if (request.action === 'toggleButton') {
        console.log('Toggle state:', request.isEnabled); // 디버깅 로그
        if (request.isEnabled) {
            createMemoButton();
        } else {
            removeMemoButton();
        }
    }
});

// 페이지 로드 시 저장된 상태 확인 및 버튼 상태 설정
chrome.storage.sync.get(['isEnabled'], function (result) {
    if (result.isEnabled) {
        createMemoButton();
    }
});
