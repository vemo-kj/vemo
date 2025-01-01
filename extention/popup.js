let isLoggedIn = false;

// DOM 요소 선택
const loginBtn = document.getElementById('login-btn');
const beforeLogin = document.getElementById('before-login');
const afterLogin = document.getElementById('after-login');

// 로그인 버튼 클릭 시 상태 변경
loginBtn.addEventListener('click', () => {
    isLoggedIn = true;
    updateUI();
});

// UI 업데이트 함수
function updateUI() {
    if (isLoggedIn) {
        beforeLogin.classList.add('hidden');
        afterLogin.classList.remove('hidden');
    } else {
        beforeLogin.classList.remove('hidden');
        afterLogin.classList.add('hidden');
    }
}

// 토글 상태 확인 및 저장
const youtubeToggle = document.querySelector('#youtube-toggle');

youtubeToggle.addEventListener('change', e => {
    const isEnabled = e.target.checked;
    // 상태 저장 (chrome.storage 사용)
    chrome.storage.sync.set({ youtubeToggle: isEnabled });
});

// 초기 상태 업데이트
updateUI();
