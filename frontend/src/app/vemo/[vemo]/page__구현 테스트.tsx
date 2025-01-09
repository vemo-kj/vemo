// 'use client';

// import dynamic from 'next/dynamic';
// import Link from 'next/link';
// import { useParams, useRouter } from 'next/navigation';
// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import styles from './Vemo.module.css';
// import SideBarNav from './components/sideBarNav/sideBarNav';
// import { CreateMemosResponseDto, CustomEditorProps, PageProps } from '../../types/vemo.types';


// import { SummaryProvider } from './context/SummaryContext';

// // 동적 로드된 DraftEditor
// const EditorNoSSR = dynamic(() => import('./components/editor/editor'), {
//     ssr: false,
// });

// interface CustomEditorProps {
//     ref?: React.Ref<unknown>;
//     getTimestamp: () => string;
//     onTimestampClick: (timestamp: string) => void;
//     isEditable?: boolean;
//     editingItemId?: string | null;
//     onEditStart?: (itemId: string) => void;
//     onEditEnd?: () => void;
//     videoId?: string;
//     onPauseVideo?: () => void;
//     onMemoSaved?: () => void;
//     memosId?: number | null;
// }

// // 페이지 컴포넌트의 props 타입 정의 추가
// interface PageProps {
//     params: {
//         vemo: string;
//     };
// }

// // 타입 정의 �가
// interface CreateMemosResponse {
//     id: number;
//     title: string;
//     createdAt: string;
//     user: {
//         id: number;
//         name: string;
//         email: string;
//     };
//     video: {
//         id: string;
//         title: string;
//     };
// }

// export default function VemoPage() {
//     const router = useRouter();
//     const params = useParams();
//     const videoId = params.vemo as string;
//     const playerRef = useRef<any>(null);
//     const editorRef = useRef<any>(null);
//     const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
//     const [selectedOption, setSelectedOption] = useState('내 메모 보기');
//     const [isEditing, setIsEditing] = useState(false);
//     const [editingItemId, setEditingItemId] = useState<string | null>(null);

//     // 새로운 상태들 추가
//     const [vemoData, setVemoData] = useState<CreateMemosResponseDto | null>(null);
//     const [memosId, setMemosId] = useState<number | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // 초기 메모 데이터 로딩
//     const fetchInitialMemoData = useCallback(async () => {
//         try {
//             const token = sessionStorage.getItem('token');
//             if (!token) {
//                 console.error('토큰이 없습니다.');
//                 setError('로그인이 필요한 서비스입니다.');
//                 router.push('/login');
//                 return;
//             }

//             // 먼모 생성
//             const createResponse = await fetch('http://localhost:5050/memos', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     title: `${videoId} 메모`,
//                     videoId: videoId,
//                     userId: 1
//                 })
//             });

//             if (!createResponse.ok) {
//                 const errorData = await createResponse.text();
//                 console.error('메모 생성 실패:', errorData);
//                 throw new Error(`메모 생성 실패: ${errorData}`);
//             }

//             const createdMemo: CreateMemosResponse = await createResponse.json();
//             console.log('생성된 메모:', createdMemo);
            
//             // 생성된 메모 데이터로 상태 업데이트
//             setVemoData(createdMemo);
//             setMemosId(createdMemo.id);
//             setIsLoading(false);

//         } catch (error) {
//             console.error('초기 데이� 로딩 실패:', error);
//             setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
//             setIsLoading(false);
//         }
//     }, [videoId, router]);

//     // 컴포넌트 마운트 시 초기 데이터 로딩
//     useEffect(() => {
//         if (videoId) {
//             fetchInitialMemoData();
//         }
//     }, [videoId, fetchInitialMemoData]);

//     // 메모 저장 후 콜백
//     const handleMemoSaved = useCallback(() => {
//         fetchInitialMemoData();
//     }, [fetchInitialMemoData]);

//     useEffect(() => {
//         if (!videoId) return;

//         // 기존 player가 있다면 제거
//         if (playerRef.current) {
//             playerRef.current.destroy();
//         }

//         // YouTube Iframe API 로드
//         const tag = document.createElement('script');
//         tag.src = 'https://www.youtube.com/iframe_api';
//         const firstScriptTag = document.getElementsByTagName('script')[0];
//         firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

//         // YouTube Player 초기화
//         (window as any).onYouTubeIframeAPIReady = () => {
//             playerRef.current = new (window as any).YT.Player('youtube-player', {
//                 videoId: videoId,
//                 events: {
//                     onReady: () => {
//                         console.log('Player ready');
//                         // Player 준비되면 timestamp 업데이트 시작
//                         startTimestampUpdate();
//                     },
//                 },
//             });
//         };
//     }, [videoId]);

//     // timestamp 업데이트 함수를 별도로 분리
//     const startTimestampUpdate = () => {
//         const interval = setInterval(() => {
//             if (playerRef.current?.getCurrentTime) {
//                 const sec = playerRef.current.getCurrentTime();
//                 const mm = Math.floor(sec / 60);
//                 const ss = Math.floor(sec % 60);
//                 setCurrentTimestamp(
//                     `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
//                 );
//             }
//         }, 1000);
//         return () => clearInterval(interval);
//     };

//     // timestamp 업데이트 useEffect 수정
//     useEffect(() => {
//         if (editingItemId !== null) return;
//         return startTimestampUpdate();
//     }, [editingItemId]);

//     // 드롭다운 선택
//     const handleOptionSelect = (option: string) => {
//         setSelectedOption(option);
//     };

//     // 노트 아이템에서 timestamp 버튼 클릭 → 해당 시각으로 이동
//     const handleSeekToTime = (timestamp: string) => {
//         const [m, s] = timestamp.split(':').map(Number);
//         const total = (m || 0) * 60 + (s || 0);
//         if (playerRef.current?.seekTo) {
//             playerRef.current.seekTo(total, true);
//         }
//     };

//     // (캡처) 메시지 수신 → editorRef.current?.addCaptureItem
//     useEffect(() => {
//         const handleMessage = (e: MessageEvent) => {
//             if (e.data.type === 'CAPTURE_TAB_RESPONSE') {
//                 editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
//             } else if (e.data.type === 'CAPTURE_AREA_RESPONSE') {
//                 editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
//             }
//         };
//         window.addEventListener('message', handleMessage);
//         return () => {
//             window.removeEventListener('message', handleMessage);
//         };
//     }, [currentTimestamp]);

//     // 전체/부분 캡처
//     const handleCaptureTab = () => {
//         window.postMessage({ type: 'CAPTURE_TAB' }, '*');
//     };
//     // 부분 캡처
//     const handleCaptureArea = () => {
//         window.postMessage({ type: 'CAPTURE_AREA' }, '*');
//     };
//     // 캡처 기능 끝

//     // 섹션 내용 렌더링
//     const renderSectionContent = () => {
//         switch (selectedOption) {
//             case '내 메모 보기':
//                 return (
//                     <>
//                         <p className={styles.noteTitle}>내 메모 내용을 여기에 표시</p>
//                         <EditorNoSSR
//                             ref={editorRef}
//                             getTimestamp={() => currentTimestamp}
//                             onTimestampClick={(timestamp: string) => {
//                                 const [m, s] = timestamp.split(':').map(Number);
//                                 const total = (m || 0) * 60 + (s || 0);
//                                 playerRef.current?.seekTo(total, true);
//                             }}
//                             isEditable={true}
//                             editingItemId={editingItemId}
//                             onEditStart={(itemId: string) => setEditingItemId(itemId)}
//                             onEditEnd={() => setEditingItemId(null)}
//                             videoId={videoId}
//                             onPauseVideo={() => playerRef.current?.pauseVideo()}
//                             onMemoSaved={handleMemoSaved}
//                             memosId={memosId}
//                         />
//                     </>
//                 );
//             // 후에 내용별 반영 예정
//             case 'AI 요약 보기':
//                 return <p className={styles.noteTitle}>AI 요약 내용을 여기에 표시</p>;
//             case '옵션 3':
//                 return <p className={styles.noteTitle}>옵션 3의 내용을 여기에 표시</p>;
//             default:
//                 return <p className={styles.noteTitle}>기본 내용을 여기에 표시</p>;
//         }
//     };

//     const changeVideo = (newVideoId: string) => {
//         router.push(`/vemo/${newVideoId}`);
//     };

//     return (
//         <div className={styles.container}>
//             {/* (1) 유튜브 영상 섹션 */}
//             <div className={styles.section1} style={{ position: 'relative' }}>
//                 <Link href="/" passHref>
//                     <img
//                         src="/icons/Button_home.svg"
//                         alt="VEMO logo"
//                         className={styles.logoButton}
//                     />
//                 </Link>
//                 <div className={styles.videoWrapper}>
//                     <iframe
//                         id="youtube-player"
//                         src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
//                         title="YouTube Video Player"
//                         frameBorder="0"
//                         allowFullScreen
//                     />
//                 </div>

//             </div>

//             {/* (3) Sidebar */}
//             <div className={styles.section3}>
//                 <SummaryProvider>
//                     <SideBarNav
//                         selectedOption={selectedOption}
//                         onOptionSelect={handleOptionSelect}
//                         renderSectionContent={renderSectionContent}
//                         currentTimestamp={currentTimestamp}
//                         handleCaptureTab={handleCaptureTab}
//                         handleCaptureArea={handleCaptureArea}
//                         editorRef={editorRef}
//                         vemoData={vemoData}
//                         videoId={videoId}
//                         memosId={memosId}
//                     />
//                 </SummaryProvider>
//             </div>
//         </div>
//     );
// }
