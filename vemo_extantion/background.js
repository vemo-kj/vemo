// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[background] 메시지 수신:", message);

  if (message.action === "captureTab") {
    // 화면 전체 캡처
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[background] 탭 캡처 오류:",
          chrome.runtime.lastError.message
        );
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        console.log("[background] 탭 캡처 완료");
        sendResponse({ dataUrl });
      }
    });
    return true; // 비동기 응답
  } else if (message.action === "startSelection") {
    // 영역 선택 시작 요청
    console.log("[background] 영역 선택 요청 수신");
    sendResponse({ started: true });
  }
});
