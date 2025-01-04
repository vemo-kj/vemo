'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Vemo.module.css';
import SideBarNav from './components/sideBarNav/sideBarNav';
import { SummaryProvider } from './context/SummaryContext';

/**
 * ----------------------------------------------------------------
 * 📌 memoService (fetch 사용)
 * ----------------------------------------------------------------
 * - 비디오 별 메모 컨테이너(memos)를 생성(POST)하거나
 *   추후 필요한 경우 GET, PUT, DELETE 등으로 확장 가능
 * - 예: /api/memos 엔드포인트에 요청을 보내 메모 컨테이너 생성
 * ----------------------------------------------------------------
 */

const API_URL = 'http://localhost:5050'; // 백엔드 서버 주소

const memoService = {
  /**
   * 메모 컨테이너 생성
   * @param data 생성할 메모 컨테이너의 정보를 담은 객체
   * @returns 생성된 메모 컨테이너 정보(JSON)
   */
  createMemos: async (data: {
    title: string;
    description: string;
    videoId: string;
    userId: number;
  }) => {
    // fetch를 이용해 POST 요청을 보냄
    const res = await fetch(`${API_URL}/home/memos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    // 응답이 정상적이지 않으면 에러 발생
    if (!res.ok) {
      throw new Error(`Failed to create memos: ${res.statusText}`);
    }

    // 응답이 정상이라면 JSON 형태로 변환해 반환
    return await res.json();
  },
};

// ----------------------------------------------------------------
// 📌 동적 로드(Dynamic Import)로 에디터 컴포넌트를 가져옴
// ----------------------------------------------------------------
const EditorNoSSR = dynamic<CustomEditorProps>(() => import('./components/editor/editor'), {
  ssr: false,
});

// ----------------------------------------------------------------
// 📌 Editor 컴포넌트에 넘길 Props 인터페이스
// ----------------------------------------------------------------
interface CustomEditorProps {
  ref?: React.Ref<unknown>;
  getTimestamp: () => string;
  onTimestampClick: (timestamp: string) => void;
  isEditable?: boolean;
  editingItemId?: string | null;
  onEditStart?: (itemId: string) => void;
  onEditEnd?: () => void;

  // [추가됨] memosId를 넘겨주어 Editor에서 getMemos 호출 가능 or 상위에서 setSections 가능
  memosId: number;
}

// ----------------------------------------------------------------
// 📌 Page 컴포넌트에 전달될 Params
// (실제 사용 여부에 따라 제거 가능)
// ----------------------------------------------------------------
interface PageProps {
  params: {
    vemo: string;
  };
}

// ----------------------------------------------------------------
// 📌 VemoPage 컴포넌트 (주요 로직)
// ----------------------------------------------------------------
export default function VemoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.vemo as string; // URL 파라미터로부터 videoId 추출
  const playerRef = useRef<any>(null);   // YouTube Player 참조
  const editorRef = useRef<any>(null);   // Editor 참조

  // 현재 동영상 재생 시점
  const [currentTimestamp, setCurrentTimestamp] = useState('00:00');

  // 사이드바에서 선택된 옵션
  const [selectedOption, setSelectedOption] = useState('내 메모 보기');

  // 에디팅 중인 아이템(메모)의 ID
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // DB와 연동할 memosId (비디오별 메모 컨테이너 식별자)
  const [memosId, setMemosId] = useState<number | null>(null);

  /**
   * (1) 유튜브 플레이어 초기화
   * - videoId가 변경될 때마다 새 Player 로드
   * - onReady 시점에 `startTimestampUpdate()` 호출
   */
  useEffect(() => {
    if (!videoId) return;

    // 기존에 플레이어가 있다면 제거 후 새로 생성
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    // 유튜브 IFrame API 스크립트 로드
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // 전역에 onYouTubeIframeAPIReady 함수 선언
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        videoId: videoId,
        events: {
          onReady: () => {
            console.log('Player ready');
            startTimestampUpdate();
          },
        },
      });
    };
  }, [videoId]);

  /**
   * (2) 타임스탬프 업데이트
   * - 1초 간격으로 현재 플레이어의 재생 시간을 가져와
   *   "MM:SS" 형태로 state에 저장
   */
  const startTimestampUpdate = () => {
    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const sec = playerRef.current.getCurrentTime();
        const mm = Math.floor(sec / 60);
        const ss = Math.floor(sec % 60);
        setCurrentTimestamp(
          `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
        );
      }
    }, 1000);

    // cleanup
    return () => clearInterval(interval);
  };

  /**
   * (2-1) 편집 중이 아닐 경우에만 타임스탬프 업데이트를 계속 수행
   */
  useEffect(() => {
    if (editingItemId !== null) return;
    return startTimestampUpdate();
  }, [editingItemId]);

  /**
   * 드롭다운(사이드바)에서 옵션을 선택했을 때의 핸들러
   */
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  /**
   * 노트 아이템 내 타임스탬프 클릭 → 해당 시각으로 이동 */
  const handleSeekToTime = (timestamp: string) => {
    const [m, s] = timestamp.split(':').map(Number);
    const total = (m || 0) * 60 + (s || 0);
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(total, true);
    }
  };

  /**
   * (3) 캡처 기능 관련: 브라우저로부터 메시지를 받으면
   *     Editor 컴포넌트의 addCaptureItem을 호출해 이미지 삽입
   */
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'CAPTURE_TAB_RESPONSE') {
        editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
      } else if (e.data.type === 'CAPTURE_AREA_RESPONSE') {
        editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [currentTimestamp]);

  /**
   * (4) 실제 캡처 요청을 브라우저에 전달
   * - CAPTURE_TAB or CAPTURE_AREA 메시지를 보내면,
   *   확장 프로그램 혹은 브라우저 스크립트가 이를 받아 처리
   */
  const handleCaptureTab = () => {
    window.postMessage({ type: 'CAPTURE_TAB' }, '*');
  };
  const handleCaptureArea = () => {
    window.postMessage({ type: 'CAPTURE_AREA' }, '*');
  };

  /**
   * (5) 사이드바에서 선택한 옵션에 따라 다른 섹션 내용을 표시
   */
  const renderSectionContent = () => {
    switch (selectedOption) {
      case '내 메모 보기':
        return (
          <>
            <p className={styles.noteTitle}>내 메모 내용을 여기에 표시</p>
            <EditorNoSSR
              ref={editorRef}
              getTimestamp={() => currentTimestamp}
              onTimestampClick={handleSeekToTime}
              isEditable={true}
              editingItemId={editingItemId}
              onEditStart={(itemId: string) => setEditingItemId(itemId)}
              onEditEnd={() => setEditingItemId(null)}
              memosId={memosId!}
            />
          </>
        );
      case 'AI 요약 보기':
        return <p className={styles.noteTitle}>AI 요약 내용을 여기에 표시</p>;
      case '옵션 3':
        return <p className={styles.noteTitle}>옵션 3의 내용을 여기에 표시</p>;
      default:
        return <p className={styles.noteTitle}>기본 내용을 여기에 표시</p>;
    }
  };

  /**
   * (6) 컴포넌트 마운트 시,
   *     1) /api/memos 엔드포인트에 POST 요청하여 새 memos 컨테이너를 생성하고
   *     2) 생성된 memosId를 state에 저장
   *
   *     - 이미 memosId가 있다면 재생성하지 않음(= 한 비디오당 하나의 컨테이너)
   */
  useEffect(() => {
    const createOrGetMemos = async () => {
      try {
        // 새로운 메모 컨테이너 생성
        const res = await memoService.createMemos({
          title: `Memo for ${videoId}`,
          description: '',
          videoId: videoId,
          userId: 1, // TODO: 실제 로그인된 사용자 ID 사용
        });
        setMemosId(res.id);
      } catch (error) {
        console.error('Failed to create memos:', error);
      }
    };

    // videoId가 있고 memosId가 아직 없다면 생성 시도
    if (videoId && !memosId) {
      createOrGetMemos();
    }
  }, [videoId]);

  /**
   * ----------------------------------------------------------------
   * 📌 최종 리턴 (UI 렌더링)
   * ----------------------------------------------------------------
   */
  return (
    <div className={styles.container}>
      {/* (7) 유튜브 영상 섹션 */}
      <div className={styles.section1} style={{ position: 'relative' }}>
        {/* 홈으로 이동하는 버튼 */}
        <Link href="/" passHref>
          <img
            src="/icons/Button_home.svg"
            alt="VEMO logo"
            className={styles.logoButton}
          />
        </Link>

        {/* 유튜브 iframe 플레이어 */}
        <div className={styles.videoWrapper}>
          <iframe
            id="youtube-player"
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
            title="YouTube Video Player"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      </div>

      {/* (8) 사이드바 및 노트 영역 */}
      <div className={styles.section3}>
        <SummaryProvider>
          <SideBarNav
            selectedOption={selectedOption}
            onOptionSelect={handleOptionSelect}
            renderSectionContent={renderSectionContent}
            currentTimestamp={currentTimestamp}
            handleCaptureTab={handleCaptureTab}
            handleCaptureArea={handleCaptureArea}
            editorRef={editorRef}
          />
        </SummaryProvider>
      </div>
    </div>
  );
}