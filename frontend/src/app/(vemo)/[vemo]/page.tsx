'use client';

import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';
import DropdownMenu from './components/DropdownMenu';
import { toPng, toCanvas } from 'html-to-image'; // html-to-image 라이브러리

// 동적 로드된 DraftEditor
const EditorNoSSR = dynamic(() => import('./components/editor'), { ssr: false });

export default function VemoPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');

    // 현재 재생 시간
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    const playerRef = useRef<any>(null); // 유튜브 플레이어 참조

    // 에디터 참조
    const editorRef = useRef<any>(null);

    // **캡처 대상**: 유튜브 영상 포함 전체 섹션
    const captureRef = useRef<HTMLDivElement | null>(null);

    // ============ 부분 캡처를 위한 상태 ============ //
    const [isSelecting, setIsSelecting] = useState(false); // 드래그 중인지
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [endX, setEndX] = useState(0);
    const [endY, setEndY] = useState(0);

    // 마우스 드래그 시작
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // 부분 캡처 모드에서만 동작
        if (!enablePartialCapture) return;

        setIsSelecting(true);
        const rect = (captureRef.current as HTMLDivElement).getBoundingClientRect();

        // e.clientX / e.clientY는 뷰포트(화면) 좌표
        // 내부 캡처 영역 기준으로 바꾸기 위해 getBoundingClientRect() 좌표를 빼줌
        setStartX(e.clientX - rect.left);
        setStartY(e.clientY - rect.top);

        setEndX(e.clientX - rect.left);
        setEndY(e.clientY - rect.top);
    };

    // 마우스 이동 중
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isSelecting || !captureRef.current) return;

        const rect = captureRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setEndX(x);
        setEndY(y);
    };

    // 마우스 드래그 끝
    const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
        if (!isSelecting) return;
        setIsSelecting(false);

        // 여기서 실제 “부분 캡처” 진행
        handlePartialCapture();
    };

    // 드래그로 지정한 영역(사각형) 스타일 계산
    const selectionStyle: React.CSSProperties = {
        display: isSelecting ? 'block' : 'none',
        position: 'absolute',
        border: '2px dashed #007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        left: Math.min(startX, endX),
        top: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
        zIndex: 9999,
    };

    // ================== 유튜브 로직 ================== //
    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId: 'pEt89CrE-6A',
                events: {
                    onReady: () => {
                        console.log('Player ready');
                    },
                },
            });
        };
    }, []);

    useEffect(() => {
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
        return () => clearInterval(interval);
    }, []);

    const handleSeekToTime = (timestamp: string) => {
        const [m, s] = timestamp.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);

        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(total, true);
        }
    };

    // 드롭다운 핸들
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    // ============ [1] 전체 캡처 ============ //
    const handleCapture = async () => {
        if (!captureRef.current) return;
        try {
            const dataUrl = await toPng(captureRef.current);
            // 에디터에 넣거나 다운로드
            if (editorRef.current?.addImageSection) {
                editorRef.current.addImageSection(dataUrl);
            }
            // 다운로드
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'capture.png';
            link.click();
        } catch (error) {
            console.error('캡처 중 오류 발생:', error);
        }
    };

    // ============ [2] 부분 캡처 ============ //
    const [enablePartialCapture, setEnablePartialCapture] = useState(false);

    const handlePartialCaptureClick = () => {
        // 버튼을 누르면 "부분 캡처 모드"를 토글
        setEnablePartialCapture(prev => !prev);
    };

    const handlePartialCapture = async () => {
        if (!captureRef.current) return;

        try {
            // 1) captureRef 전체를 canvas로 변환
            const fullCanvas = await toCanvas(captureRef.current);

            // 2) 드래그로 지정한 영역만 새 캔버스에 그려서 잘라냄
            const sx = Math.min(startX, endX);
            const sy = Math.min(startY, endY);
            const sw = Math.abs(endX - startX);
            const sh = Math.abs(endY - startY);

            // 잘라낼 너비나 높이가 0 이하인 경우 예외처리
            if (sw < 1 || sh < 1) return;

            // 새 캔버스 생성
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = sw;
            croppedCanvas.height = sh;

            const ctx = croppedCanvas.getContext('2d');
            if (!ctx) return;

            // (x, y)에서 (w, h)만큼 그려넣기
            ctx.drawImage(fullCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

            // 최종 이미지 Data URL
            const dataUrl = croppedCanvas.toDataURL('image/png');

            // 에디터에 추가 (타임스탬프 포함)
            if (editorRef.current?.addImageSection) {
                editorRef.current.addImageSection(dataUrl);
            }

            // 다운로드
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'partial_capture.png';
            link.click();

            // 부분 캡처 모드 비활성화
            setEnablePartialCapture(false);
        } catch (error) {
            console.error('부분 캡처 중 오류 발생:', error);
        }
    };

    return (
        <div className={styles.container}>
            {/* (1) 유튜브 영상 섹션. captureRef를 여기에 달면 전체가 캡처 대상 */}
            <div
                className={styles.section1}
                ref={captureRef}
                // 부분 캡처 모드에서만 마우스 이벤트 발생
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ position: 'relative' }} // selection box를 absolute로 띄우려면 relative 부모가 필요
            >
                {/* 드래그 시 표시되는 "선택 영역 박스" */}
                <div style={selectionStyle}></div>

                <Link href="/" passHref>
                    <img
                        src="/icons/Button_home.svg"
                        alt="VEMO logo"
                        className={styles.logoButton}
                    />
                </Link>
                <div className={styles.videoWrapper}>
                    <iframe
                        id="youtube-player"
                        src="https://www.youtube.com/embed/pEt89CrE-6A?enablejsapi=1"
                        title="YouTube Video Player"
                        frameBorder="0"
                        allowFullScreen
                    />
                </div>
            </div>

            {/* (2) 노트 / 에디터 영역 */}
            <div className={styles.section2}>
                <h1 className={styles.notesHeader}>나만의 노트</h1>
                <p className={styles.notesSubHeader}>자바 스크립트 스터디 재생목록</p>

                <div className={styles.notesContent}>
                    <p className={styles.noteTitle}>자바 스크립트 스터디1111</p>
                    <div className={styles.noteActions}>
                        <div className={styles.dropdown}>
                            <DropdownMenu
                                options={['내 메모 보기', 'AI 요약 보기', '옵션 3']}
                                defaultOption={selectedOption}
                                onSelect={handleOptionSelect}
                            />
                        </div>
                    </div>
                </div>

                <EditorNoSSR
                    ref={editorRef}
                    getTimestamp={() => currentTimestamp}
                    onTimestampClick={handleSeekToTime}
                />

                <div className={styles.footerButtons}>
                    {/* 전체 캡처 */}
                    <button onClick={handleCapture}>캡처하기</button>

                    {/* 부분 캡처: 버튼 토글로 on/off */}
                    <button
                        style={{
                            backgroundColor: enablePartialCapture ? 'tomato' : 'inherit',
                        }}
                        onClick={handlePartialCaptureClick}
                    >
                        부분캡처 모드 {enablePartialCapture ? '종료' : '시작'}
                    </button>

                    <button>요약하기</button>
                    <button>내보내기</button>
                </div>
            </div>

            {/* (3) Sidebar */}
            <div className={styles.section3}>
                <button className={styles.sidebarButton}>작성하기</button>
                <button className={styles.sidebarButton}>커뮤니티</button>
                <button className={styles.sidebarButton}>재생목록</button>
            </div>
        </div>
    );
}
