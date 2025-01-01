'use client';

import React, { useEffect, useState } from 'react';
import styles from './Playlist.module.css';

interface Video {
  id: string;
  thumbnail: string;
  title: string;
  channelIcon: string;
  channelName: string;
  duration: string; // HH:MM:SS 형식
}



export default function Playlist() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [totalDuration, setTotalDuration] = useState<string>('00:00:00');

  // 서버에서 데이터 가져오기
  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/playlist'); // 서버 API 엔드포인트
        const data: Video[] = await response.json();
        setVideos(data);

        // 총 재생시간 계산
        const totalSeconds = data.reduce((acc, video) => {
          const [hours, minutes, seconds] = video.duration.split(':').map(Number);
          return acc + hours * 3600 + minutes * 60 + seconds;
        }, 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTotalDuration(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } catch (error) {
        console.error('Failed to fetch playlist data:', error);
      }
    }

    fetchVideos();
  }, []);

  return (
    <div className={styles.playlistContainer}>
      <h1>재생목록</h1>
      <div className={styles.summary}>
        <p>동영상 {videos.length}개</p>
        <p>총 재생시간: {totalDuration}</p>
      </div>
      <div className={styles.videoList}>
        {videos.map((video) => (
          <div key={video.id} className={styles.videoCard}>
            <img src={video.thumbnail} alt={video.title} className={styles.thumbnail} />
            <div className={styles.videoInfo}>
              <h3 className={styles.title}>{video.title}</h3>
              <div className={styles.channelInfo}>
                <img src={video.channelIcon} alt={video.channelName} className={styles.channelIcon} />
                <p className={styles.channelName}>{video.channelName}</p>
              </div>
              <p className={styles.duration}>{video.duration}</p>
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

