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
  // 1) 먼저 background에 탭 캡처 요청
  chrome.runtime.sendMessage({ action: "captureTab" }, (response) => {
    if (response && response.dataUrl) {
      // 2) YouTube iframe의 bounding rect 얻기
      //    (content script가 접근 가능: 부모 DOM 기준)
      const iframe = document.getElementById("youtube-player");
      if (!iframe) {
        // 없으면 그냥 전체 이미지 반환
        postMessageToPage("CAPTURE_TAB_RESPONSE", response.dataUrl);
        return;
      }

      // iframe의 위치 & 크기
      const rect = iframe.getBoundingClientRect();

      const x = Math.floor(rect.left + window.scrollX);
      const y = Math.floor(rect.top + window.scrollY);
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      // 3) Canvas로 잘라내기
      cropImage(response.dataUrl, x, y, w, h, (croppedUrl) => {
        postMessageToPage("CAPTURE_TAB_RESPONSE", croppedUrl);
      });
    } else if (response && response.error) {
      console.error("[content.js] 캡처 오류:", response.error);
    }
  });
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
    // 선택된 영역을 (pageXOffset, pageYOffset)까지 고려해 크롭
    const realX = Math.min(startX, endX) + window.scrollX;
    const realY = Math.min(startY, endY) + window.scrollY;

    // 1) 전체 탭 캡처
    chrome.runtime.sendMessage({ action: "captureTab" }, (resp) => {
      if (resp && resp.dataUrl) {
        // 2) (realX, realY, width, height)만 크롭
        cropImage(resp.dataUrl, realX, realY, width, height, (croppedUrl) => {
          postMessageToPage("CAPTURE_TAB_RESPONSE", croppedUrl);
        });
      }
    });
  }

  // 선택 모드 종료
  removeSelectionOverlay();
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
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const croppedUrl = canvas.toDataURL("image/png");
    callback(croppedUrl);
  };
  img.src = dataUrl;
}

function postMessageToPage(type, dataUrl) {
  window.postMessage({ type, dataUrl }, "*");
}
