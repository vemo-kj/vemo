// content.js

// -----------------------------------------------------------
// 메시지 수신: 웹 페이지(React) → content script
// -----------------------------------------------------------
window.addEventListener('message', event => {
  if (event.source !== window) return; // 보안상 체크

  const { type } = event.data;
  console.log('[Vemo Extension] 메시지 수신:', type);

  if (type === 'CAPTURE_TAB') {
      console.log('[Vemo Extension] 전체 캡처 시작');
      // "전체 캡처" 버튼 → 실제로는 유튜브 플레이어 영역만 잘라서 반환
      captureYouTubePlayer();
  } else if (type === 'CAPTURE_AREA') {
      console.log('[Vemo Extension] 부분 캡처 시작');
      // "영역 선택" 버튼
      chrome.runtime.sendMessage({ action: 'startSelection' }, resp => {
          if (resp && resp.started) {
              activateSelectionOverlay();
          }
      });
  }
});

// -----------------------------------------------------------
// 1) 전체 캡처 대신 "YouTube 플레이어만 크롭" 예시
// -----------------------------------------------------------
function captureYouTubePlayer() {
    const iframe = document.getElementById('youtube-player');
    if (!iframe) {
        postMessageToPage('CAPTURE_TAB_RESPONSE', null);
        return;
    }

    // 정확한 위치와 크기 계산
    const rect = iframe.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    const absoluteRect = {
        left: Math.round(rect.left * scale),
        top: Math.round(rect.top * scale),
        width: Math.round(rect.width * scale),
        height: Math.round(rect.height * scale),
    };

    // 스크롤 위치는 scale과 별개로 처리
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // 최종 캡처 위치 계산
    absoluteRect.left += Math.round(scrollLeft * scale);
    absoluteRect.top += Math.round(scrollTop * scale);

    // 캡처 전에 스크롤 위치 저장
    const originalScroll = {
        x: window.scrollX,
        y: window.scrollY,
    };

    // 캡처할 요소가 뷰포트 내에 완전히 보이도록 스크롤
    iframe.scrollIntoView({
        behavior: 'instant',
        block: 'center',
    });

    // 요소가 뷰포트에 자리잡을 때까지 잠시 대기
    setTimeout(() => {
        chrome.runtime.sendMessage({ action: 'captureTab' }, response => {
            if (!response || !response.dataUrl) {
                console.error('[Vemo Extension] 캡처 실패');
                postMessageToPage('CAPTURE_TAB_RESPONSE', null);
                return;
            }

            cropImage(
                response.dataUrl,
                absoluteRect.left,
                absoluteRect.top,
                absoluteRect.width,
                absoluteRect.height,
                croppedUrl => {
                    if (!croppedUrl) {
                        console.error('[Vemo Extension] 크롭 실패');
                        postMessageToPage('CAPTURE_TAB_RESPONSE', null);
                        return;
                    }

                    // 성공적으로 처리된 경우
                    postMessageToPage('CAPTURE_TAB_RESPONSE', croppedUrl);

                    // 시각적 피드백은 캡처 완료 후에 표시
                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                        position: fixed;
                        border: 2px solid #ff0000;
                        background: rgba(255, 0, 0, 0.2);
                        pointer-events: none;
                        z-index: 999999;
                        left: ${rect.left}px;
                        top: ${rect.top}px;
                        width: ${rect.width}px;
                        height: ${rect.height}px;
                        transition: opacity 0.3s ease;
                    `;
                    document.body.appendChild(overlay);

                    setTimeout(() => {
                        overlay.style.opacity = '0';
                        setTimeout(() => overlay.remove(), 300);
                    }, 300);
                }
            );
        });
    }, 100);
}

// -----------------------------------------------------------
// 2) 선택 영역 캡처 (드래그 오버레이)
// -----------------------------------------------------------
let overlay = null;
let selectionBox = null;
let isSelecting = false;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

function addSelectionStyles() {
  const style = document.createElement('style');
  style.textContent = `
      #vemo-selection-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.2);
          cursor: crosshair;
          z-index: 999999;
      }

      #vemo-selection-box {
          position: fixed;
          border: 2px solid #1a73e8;
          background: rgba(26, 115, 232, 0.1);
          display: none;
          z-index: 999999;
      }
  `;
  document.head.appendChild(style);
}

function activateSelectionOverlay() {
  addSelectionStyles();
  removeSelectionOverlay();

  // 1) 전체 화면 덮는 오버레이 생성
  overlay = document.createElement('div');
  overlay.id = 'vemo-selection-overlay';
  document.body.appendChild(overlay);

  // 2) 드래그 영역 박스
  selectionBox = document.createElement('div');
  selectionBox.id = 'vemo-selection-box';
  document.body.appendChild(selectionBox);

  // 마우스 이벤트 연결
  overlay.addEventListener('mousedown', onMouseDown, true);
  overlay.addEventListener('mousemove', onMouseMove, true);
  overlay.addEventListener('mouseup', onMouseUp, true);

  isSelecting = true;
}

function removeSelectionOverlay() {
  if (overlay) {
      overlay.removeEventListener('mousedown', onMouseDown, true);
      overlay.removeEventListener('mousemove', onMouseMove, true);
      overlay.removeEventListener('mouseup', onMouseUp, true);
      overlay.remove();
      overlay = null;
  }
  if (selectionBox) {
      selectionBox.remove();
      selectionBox = null;
  }
  isSelecting = false;
}

function onMouseDown(e) {
  if (!isSelecting) return;
  startX = e.clientX;
  startY = e.clientY;
  endX = startX;
  endY = startY;

  selectionBox.style.left = `${startX}px`;
  selectionBox.style.top = `${startY}px`;
  selectionBox.style.width = `0px`;
  selectionBox.style.height = `0px`;
  selectionBox.style.display = 'block';
}

function onMouseMove(e) {
  if (!isSelecting) return;
  endX = e.clientX;
  endY = e.clientY;
  updateSelectionBox();
}

function onMouseUp(e) {
  if (!isSelecting) return;
  endX = e.clientX;
  endY = e.clientY;
  updateSelectionBox();

  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  if (width > 5 && height > 5) {
      const scale = window.devicePixelRatio || 1;

      // 선택 영역의 정확한 위치 계산
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);

      // 스크롤 위치 고려
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // 최종 캡처 영역 계산 (스케일링 적용)
      const captureArea = {
          x: Math.round((left + scrollLeft) * scale),
          y: Math.round((top + scrollTop) * scale),
          width: Math.round(width * scale),
          height: Math.round(height * scale),
      };

      // 캡처를 위해 선택 오버레이를 임시로 숨김
      overlay.style.opacity = '0';
      selectionBox.style.opacity = '0';

      // 약간의 지연을 주어 오버레이가 완전히 숨겨지도록 함
      setTimeout(() => {
          // 전체 탭 캡처 후 크롭
          chrome.runtime.sendMessage({ action: 'captureTab' }, resp => {
              if (resp && resp.dataUrl) {
                  cropImage(
                      resp.dataUrl,
                      captureArea.x,
                      captureArea.y,
                      captureArea.width,
                      captureArea.height,
                      croppedUrl => {
                          // 캡처 완료 후 하이라이트 표시
                          showCaptureHighlight(left, top, width, height);
                          postMessageToPage('CAPTURE_TAB_RESPONSE', croppedUrl);
                          // 캡처 완료 후 선택 오버레이 제거
                          removeSelectionOverlay();
                      },
                  );
              }
          });
      }, 50); // 50ms 지연
  } else {
      removeSelectionOverlay();
  }

  e.preventDefault();
  e.stopPropagation();
}

function updateSelectionBox() {
  if (!selectionBox) return;

  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  selectionBox.style.left = `${left}px`;
  selectionBox.style.top = `${top}px`;
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;
}

// -----------------------------------------------------------
// 3) 공통: 이미지 크롭 함수 (Canvas 사용)
// -----------------------------------------------------------
function cropImage(dataUrl, cropX, cropY, cropW, cropH, callback) {
    if (!dataUrl) {
        callback(null);
        return;
    }

    const img = new Image();
    img.onerror = () => callback(null);
    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = cropW;
            canvas.height = cropH;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                callback(null);
                return;
            }

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                img,
                cropX,
                cropY,
                cropW,
                cropH,
                0,
                0,
                cropW,
                cropH,
            );

            const croppedUrl = canvas.toDataURL('image/png', 1.0);
            callback(croppedUrl);
        } catch (error) {
            console.error('[Vemo Extension] 이미지 크롭 실패:', error);
            callback(null);
        }
    };
    img.src = dataUrl;
}

function postMessageToPage(type, dataUrl) {
    console.log('[Vemo Extension] 캡처 완료, 웹으로 전송:', type);
    const response = {
        type,
        ok: dataUrl !== null,  // dataUrl이 있으면 true, 없으면 false
        dataUrl,
    };
    console.log('[Vemo Extension] 전송할 응답:', response);
    window.postMessage(response, '*');
}

// 캡처 완료 후 하이라이트 표시 함수
function showCaptureHighlight(left, top, width, height) {
  const highlight = document.createElement('div');
  highlight.className = 'capture-highlight';
  highlight.style.cssText = `
    left: ${left}px;
    top: ${top}px;
    width: ${width}px;
    height: ${height}px;
  `;

  document.body.appendChild(highlight);

  // 1초 후 페이드 아웃
  setTimeout(() => {
      highlight.style.opacity = '0';
      setTimeout(() => highlight.remove(), 300);
  }, 300);
}
