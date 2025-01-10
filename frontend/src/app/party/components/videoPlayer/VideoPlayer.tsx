'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

interface VideoPlayerProps {
    videoId: string;
}

interface VideoState {
    currentTime: number;
    isPlaying: boolean;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
    const socketRef = useRef<any>(null);
    const playerRef = useRef<YT.Player | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);
    const [videoState, setVideoState] = useState<VideoState>({
        currentTime: 0,
        isPlaying: false,
    });

    useEffect(() => {
        // YouTube API 로드
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // YouTube Player 초기화
        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId,
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                },
                playerVars: {
                    enablejsapi: 1,
                    controls: 1,
                },
            });
        };

        // Socket.io 연결 및 이벤트 설정
        try {
            console.log('소켓 연결 시도 중...');
            socketRef.current = io('http://localhost:5050/video', {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // 소켓 연결 이벤트
            socketRef.current.on('connect', () => {
                console.log('소켓 연결 성공! Socket ID:', socketRef.current.id);
                setIsConnected(true);
                socketRef.current.emit('joinRoom', { videoId });
            });

            // 에러 처리
            socketRef.current.on('connect_error', (error: any) => {
                console.error('소켓 연결 실패:', error.message);
                setIsConnected(false);
            });

            socketRef.current.on('disconnect', (reason: string) => {
                console.log('소켓 연결이 끊어졌습니다. 이유:', reason);
                setIsConnected(false);
            });

            // 시청자 수 업데이트
            socketRef.current.on('viewerUpdate', ({ count }: { count: number }) => {
                console.log('시청자 수 업데이트:', count);
                setViewerCount(count);
            });

            // 비디오 상태 동기화
            socketRef.current.on('syncVideoState', ({ currentTime, isPlaying }: VideoState) => {
                console.log('비디오 상태 동기화:', { currentTime, isPlaying });
                if (playerRef.current) {
                    playerRef.current.seekTo(currentTime, true);
                    if (isPlaying) {
                        playerRef.current.playVideo();
                    } else {
                        playerRef.current.pauseVideo();
                    }
                }
            });

            // 비디오 시간 동기화
            socketRef.current.on('syncVideoTime', ({ currentTime }: { currentTime: number }) => {
                console.log('비디오 시간 동기화:', currentTime);
                if (playerRef.current) {
                    playerRef.current.seekTo(currentTime, true);
                }
            });
        } catch (error) {
            console.error('소켓 초기화 중 에러 발생:', error);
        }

        return () => {
            if (socketRef.current) {
                console.log('소켓 연결을 종료합니다.');
                socketRef.current.disconnect();
            }
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [videoId]);

    // YouTube Player 이벤트 핸들러
    const onPlayerReady = (event: YT.PlayerEvent) => {
        console.log('플레이어 준비됨');
    };

    const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
        if (!socketRef.current) return;

        const currentTime = playerRef.current?.getCurrentTime() || 0;

        switch (event.data) {
            case YT.PlayerState.PLAYING:
                socketRef.current.emit('videoStateChange', {
                    videoId,
                    currentTime,
                    isPlaying: true,
                });
                break;
            case YT.PlayerState.PAUSED:
                socketRef.current.emit('videoStateChange', {
                    videoId,
                    currentTime,
                    isPlaying: false,
                });
                break;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="relative pt-[56.25%]">
                <div id="youtube-player" className="absolute top-0 left-0 w-full h-full" />
            </div>
            <div className="mt-4 space-y-2">
                <div className="text-center">
                    <p className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                        {isConnected ? '서버에 연결됨' : '서버 연결 끊김'}
                    </p>
                </div>
                <div className="text-center text-sm text-gray-600">
                    현재 시청자 수: {viewerCount}명
                </div>
                <div className="text-center text-sm">
                    {videoState.isPlaying ? '재생 중' : '일시 정지'}
                </div>
            </div>
        </div>
    );
}
