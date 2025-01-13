'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './PlayList.module.css';

interface Playlist {
    id: number;
    name: string;
    userId: number;
    videos: Array<{
        id: string;
        title: string;
        thumbnails: string;
        duration: string;
        category: string;
    }>;
}

export default function Playlist() {
    const searchParams = useSearchParams();
    const playlistId = searchParams ? searchParams.get('playlistId') : null;
    const videoId = searchParams ? searchParams.get('vemo') : null;
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [totalDuration, setTotalDuration] = useState<string>('00:00:00');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPlaylist() {
            if (!playlistId) {
                setError('playlistId가 없습니다.');
                setIsLoading(false);
                return;
            }

            const accessToken = localStorage.getItem('token');
            if (!accessToken) {
                setError('로그인이 필요합니다.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/vemo/playlists/${playlistId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error('플레이리스트를 불러올 수 없습니다.');
                }

                const data = await response.json();
                console.log('받은 데이터:', data);

                if (data && Array.isArray(data.videos)) {
                    setPlaylist(data);

                    const totalSeconds = data.videos.reduce(
                        (acc: number, video: { duration: string }) => {
                            if (!video.duration) return acc;

                            try {
                                const [hours, minutes, seconds] = video.duration
                                    .split(':')
                                    .map(Number);
                                return acc + (hours * 3600 + minutes * 60 + seconds);
                            } catch (error) {
                                console.error('재생시간 계산 중 오류:', error);
                                return acc;
                            }
                        },
                        0,
                    );

                    const displayHours = Math.floor(totalSeconds / 3600);
                    const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
                    const displaySeconds = totalSeconds % 60;

                    setTotalDuration(
                        `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`,
                    );
                } else {
                    setError('올바른 데이터 형식이 아닙니다.');
                }
            } catch (error) {
                setError(
                    error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchPlaylist();
    }, [playlistId]);

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!playlist || !playlist.videos) {
        return <div>플레이리스트를 찾을 수 없습니다.</div>;
    }

    return (
        <div className={styles.playlistContainer}>
            <h1>재생목록</h1>
            <div className={styles.summary}>
                <p>재생목록: {playlist.name}</p>
                <p>동영상 수: {playlist.videos.length}개</p>
                <p>총 재생시간: {totalDuration}</p>
            </div>
            <div className={styles.videoList}>
                {playlist.videos.map((video, index) => {
                    const isPlaying = video.id === (searchParams?.get('vemo') ?? null);

                    return (
                        <Link
                            key={video.id}
                            href={`/vemo/${video.id}?playlistId=${playlistId}`}
                            className={styles.videoLink}
                        >
                            <div
                                className={`${styles.videoCard} ${isPlaying ? styles.playing : ''}`}
                            >
                                {video.thumbnails && (
                                    <img
                                        src={video.thumbnails}
                                        alt={video.title || '비디오 썸네일'}
                                        className={styles.thumbnail}
                                        onError={e => {
                                            e.currentTarget.src = '/default-thumbnail.jpg';
                                        }}
                                    />
                                )}
                                <div className={styles.videoInfo}>
                                    <h3 className={styles.title}>{video.title || '제목 없음'}</h3>
                                    <p className={styles.duration}>{video.duration || '00:00'}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
