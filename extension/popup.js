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

// 초기 상태 업데이트
updateUI();

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleButton');

    // 저장된 상태 불러오기
    chrome.storage.sync.get(['isEnabled'], function (result) {
        toggleButton.checked = result.isEnabled || false;
    });

    toggleButton.addEventListener('change', function () {
        const isEnabled = toggleButton.checked;

        // 상태 저장
        chrome.storage.sync.set({ isEnabled: isEnabled });

        // 현재 활성화된 탭에 메시지 전송
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggleButton',
                    isEnabled: isEnabled,
                });
            }
        });
    });
});
