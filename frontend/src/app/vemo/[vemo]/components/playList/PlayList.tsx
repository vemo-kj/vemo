'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './Playlist.module.css';

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
    },
    category: string;
  };
}

export default function Playlist() {
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlistId');
  const [videos, setVideos] = useState<playlists[]>([]);
  const [totalDuration, setTotalDuration] = useState<string>('00:00:00');


  const id = '삼육구'
  // 서버에서 데이터 가져오기
  useEffect(() => {
    async function fetchPlaylists() {
      if (!playlistId) {
        console.error('playlistId가 없습니다.');
        return;
      }

      const accessToken = sessionStorage.getItem('token');
      if (!accessToken) {
        console.error('로그인 토큰이 없습니다.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5050/vemo/playlists/${playlistId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const data = await response.json();
        console.log('받은 데이터:', data);
        console.log('받은 데이터 전체:', data);
        console.log('데이터 길이:', data.length);
        console.log('데이터 타입:', typeof data);

        if (Array.isArray(data)) {
          setVideos(data);

          const totalSeconds = data.reduce((acc, playlist) => {
            if (!playlist?.videos?.duration) {
              return acc;
            }

            try {
              const [hours, minutes, seconds] = playlist.videos.duration.split(':').map(Number);
              return acc + (hours * 3600 + minutes * 60 + seconds);
            } catch (error) {
              console.error('재생시간 계산 중 오류:', error);
              return acc;
            }
          }, 0);

          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          setTotalDuration(
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          );
        } else {
          console.error('Fetched data is not an array:', data);
        }
      } catch (error) {
        console.error('Failed to fetch playlist data:', error);
      }
    }

    fetchPlaylists();
  }, [playlistId]);

  return (
    <div className={styles.playlistContainer}>
      <h1>재생목록</h1>
      <div className={styles.summary}>
        <p>동영상 {videos.length}개</p>
        <p>총 재생시간: {totalDuration}</p>
      </div>
      <div className={styles.videoList}>
        {videos.map((video) => {
          // 필요한 데이터가 모두 있는지 확인
          if (!video?.videos?.thumbnail || !video?.videos?.title ||
            !video?.videos?.channel?.thumbnail || !video?.videos?.channel?.title) {
            return null; // 필요한 데이터가 없는 경우 해당 항목 건너뛰기
          }

          return (
            <div key={video.id} className={styles.videoCard}>
              <img
                src={video.videos.thumbnail}
                alt="썸네일"
                className={styles.thumbnail}
                onError={(e) => {
                  e.currentTarget.src = '/default-thumbnail.jpg'; // 기본 썸네일 이미지로 대체
                }}
              />
              <div className={styles.videoInfo}>
                <h3 className={styles.title}>{video.videos.title}</h3>
                <div className={styles.channelInfo}>
                  <img
                    src={video.videos.channel.thumbnail}
                    alt="채널 아이콘"
                    className={styles.channelIcon}
                    onError={(e) => {
                      e.currentTarget.src = '/default-channel-icon.jpg'; // 기본 채널 아이콘으로 대체
                    }}
                  />
                  <p className={styles.channelName}>{video.videos.channel.title}</p>
                </div>
                <p className={styles.duration}>{video.videos.duration || '00:00'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
