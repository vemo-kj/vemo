'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './PlayList.module.css';
import Link from 'next/link';

interface playlists {
  id: number;
  name: string;
  userId: number;
  videos: {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    channel: {
      id: string;
      title: string;
      thumbnail: string;
    }
  }
}

export default function Playlist() {
  const [videos, setVideos] = useState<playlists[]>([]);
  const [totalDuration, setTotalDuration] = useState<string>('00:00:00');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const response = await fetch('/api/playlist'); // 서버 API 엔드포인트
        const data: playlists[] = await response.json();
        setVideos(data);

        if (!response.ok) {
          throw new Error('플레이리스트를 불러올 수 없습니다.');
        }

        const data = await response.json();
        console.log('받은 데이터:', data);

        if (data && Array.isArray(data.videos)) {
          setPlaylist(data);

          const totalSeconds = data.videos.reduce((acc: number, video: { duration: string }) => {
            if (!video.duration) return acc;

            try {
              const [hours, minutes, seconds] = video.duration.split(':').map(Number);
              return acc + (hours * 3600 + minutes * 60 + seconds);
            } catch (error) {
              console.error('재생시간 계산 중 오류:', error);
              return acc;
            }
          }, 0);

          const displayHours = Math.floor(totalSeconds / 3600);
          const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
          const displaySeconds = totalSeconds % 60;

          setTotalDuration(
            `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`
          );
        } else {
          setError('올바른 데이터 형식이 아닙니다.');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlaylists();
  }, []);

  return (
    <div className={styles.playlistContainer}>
      <h1>재생목록</h1>
      <div className={styles.summary}>
        <p>재생목록: {playlist.name}</p>
        <p>동영상 수: {playlist.videos.length}개</p>
        <p>총 재생시간: {totalDuration}</p>
      </div>
      <div className={styles.videoList}>
        {videos.map((video) => (
          <div key={video.id} className={styles.videoCard}>
            <img src={video.videos.thumbnail} className={styles.thumbnail} />
            <div className={styles.videoInfo}>
              <h3 className={styles.title}>{video.videos.title}</h3>
              <div className={styles.channelInfo}>
                <img src={video.videos.channel.thumbnail} className={styles.channelIcon} />
                <p className={styles.channelName}>{video.videos.channel.title}</p>
              </div>
              <p className={styles.duration}>{video.videos.duration}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.addButtonContainer}>
        <button className={styles.addButton}>추가하기</button>
      </div>
    </div>
  );
}
