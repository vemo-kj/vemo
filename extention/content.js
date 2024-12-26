console.log('YouTube Helper 익스텐션 작동 중...');

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

// 페이지가 로드될 때 버튼 추가
addMemoButton();

// 유튜브 페이지 전환 감지 (SPA 대응)
const observer = new MutationObserver(() => {
    addMemoButton();
});
observer.observe(document.body, { childList: true, subtree: true });
