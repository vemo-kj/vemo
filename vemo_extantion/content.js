// content.js

// -----------------------------------------------------------
// 메시지 수신: 웹 페이지(React) → content script
// -----------------------------------------------------------
window.addEventListener("message", (event) => {
  if (event.source !== window) return; // 보안상 체크

  const { type } = event.data;
  if (type === "CAPTURE_TAB") {
    // "전체 캡처" 버튼 → 실제로는 유튜브 플레이어 영역만 잘라서 반환
    captureYouTubePlayer();
  } else if (type === "CAPTURE_AREA") {
    // "영역 선택" 버튼
    chrome.runtime.sendMessage({ action: "startSelection" }, (resp) => {
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
  const iframe = document.getElementById("youtube-player");
  if (!iframe) return;

  // 정확한 위치와 크기 계산
  const rect = iframe.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;

  const absoluteRect = {
    left: Math.round(rect.left * scale),
    top: Math.round(rect.top * scale),
    width: Math.round(rect.width * scale),
    height: Math.round(rect.height * scale)
  };

  // 스크롤 위치는 scale과 별개로 처리
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  // 최종 캡처 위치 계산
  absoluteRect.left += Math.round(scrollLeft * scale);
  absoluteRect.top += Math.round(scrollTop * scale);
  
  // 캡처 영역 표시를 위한 오버레이
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    border: 2px solid #ff0000;
    background: rgba(255, 0, 0, 0.2);
    pointer-events: none;
    z-index: 999999;
    transition: opacity 0.3s ease;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
  `;
  document.body.appendChild(overlay);

  // 캡처 전에 스크롤 위치 저장
  const originalScroll = {
    x: window.scrollX,
    y: window.scrollY
  };

  // 캡처할 요소가 뷰포트 내에 완전히 보이도록 스크롤
  iframe.scrollIntoView({
    behavior: 'instant',
    block: 'center'
  });

  // 요소가 뷰포트에 자리잡을 때까지 잠시 대기
  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "captureTab" }, (response) => {
      if (response && response.dataUrl) {
        // 캡처 후 원래 스크롤 위치로 복원
        window.scrollTo(originalScroll.x, originalScroll.y);

        cropImage(
          response.dataUrl, 
          absoluteRect.left,
          absoluteRect.top,
          absoluteRect.width,
          absoluteRect.height,
          (croppedUrl) => {
            console.log('Capture dimensions:', {
              left: absoluteRect.left,
              top: absoluteRect.top,
              width: absoluteRect.width,
              height: absoluteRect.height
            });
            postMessageToPage("CAPTURE_TAB_RESPONSE", croppedUrl);
            
            // 오버레이 제거
            overlay.style.opacity = "0";
            setTimeout(() => overlay.remove(), 300);
          }
        );
      }
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

function activateSelectionOverlay() {
  // 이미 오버레이가 있으면 제거 후 다시 만들거나 재활용
  removeSelectionOverlay();

  // 1) 전체 화면 덮는 오버레이 생성
  overlay = document.createElement("div");
  overlay.id = "vemo-selection-overlay";
  document.body.appendChild(overlay);

  // 2) 드래그 영역 박스
  selectionBox = document.createElement("div");
  selectionBox.id = "vemo-selection-box";
  document.body.appendChild(selectionBox);

  // 마우스 이벤트 연결
  overlay.addEventListener("mousedown", onMouseDown, true);
  overlay.addEventListener("mousemove", onMouseMove, true);
  overlay.addEventListener("mouseup", onMouseUp, true);

  isSelecting = true;
}

function removeSelectionOverlay() {
  if (overlay) {
    overlay.removeEventListener("mousedown", onMouseDown, true);
    overlay.removeEventListener("mousemove", onMouseMove, true);
    overlay.removeEventListener("mouseup", onMouseUp, true);
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
  selectionBox.style.display = "block";
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
      height: Math.round(height * scale)
    };

    // 캡처 전에 선택 오버레이 제거
    removeSelectionOverlay();

    // 전체 탭 캡처 후 크롭
    chrome.runtime.sendMessage({ action: "captureTab" }, (resp) => {
      if (resp && resp.dataUrl) {
        cropImage(
          resp.dataUrl, 
          captureArea.x,
          captureArea.y,
          captureArea.width,
          captureArea.height,
          (croppedUrl) => {
            // 캡처 완료 후에만 하이라이트 표시
            showCaptureHighlight(left, top, width, height);
            postMessageToPage("CAPTURE_TAB_RESPONSE", croppedUrl);
          }
        );
      }
    });
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
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    // 원본 이미지의 비율을 유지하면서 캡처
    canvas.width = cropW;
    canvas.height = cropH;
    
    const ctx = canvas.getContext("2d");
    // 이미지 스무딩 비활성화로 선명도 유지
    ctx.imageSmoothingEnabled = false;
    
    // 정확한 위치에서 크롭
    ctx.drawImage(
      img,
      cropX, cropY,    // 소스 이미지의 시작점
      cropW, cropH,    // 소스 이미지에서 잘라낼 영역
      0, 0,           // 캔버스에 그릴 위치
      cropW, cropH    // 캔버스에 그릴 크기
    );
    
    const croppedUrl = canvas.toDataURL("image/png", 1.0); // 최대 품질로 저장
    callback(croppedUrl);
  };
  img.src = dataUrl;
}

function postMessageToPage(type, dataUrl) {
  window.postMessage({ type, dataUrl }, "*");
}

// 캡처 완료 후 하이라이트 표시 함수
function showCaptureHighlight(left, top, width, height) {
  const highlight = document.createElement("div");
  highlight.className = "capture-highlight";
  highlight.style.cssText = `
    left: ${left}px;
    top: ${top}px;
    width: ${width}px;
    height: ${height}px;
  `;
  
  document.body.appendChild(highlight);

  // 1초 후 페이드 아웃
  setTimeout(() => {
    highlight.style.opacity = "0";
    setTimeout(() => highlight.remove(), 300);
  }, 300);
}
