'use client'
import { useState, useEffect } from 'react';
import Header from '../../components/Layout/Header'
import MyCard from "./components/mycard/MyCard"
import MyCardHeader from '../mypage/components/myCardHeader/MyCardHeader'
import MyProfile from './components/myProfile/myProfile'
import styles from './MyPage.module.css'
import Image from 'next/image'

interface PlaylistResponse {
  id: number;
  name: string;
  totalVideos: number;
  thumbnail: string;
  previewVideos: Array<{
    id: string;
    title: string;
    channel: string;
  }>;
}

export default function MyPage() {
  const [playlists, setPlaylists] = useState<PlaylistResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMemos, setTotalMemos] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const accessToken = sessionStorage.getItem('token');
        if (!accessToken) {
          setError('로그인이 필요합니다.');
          return;
        }

        const playlistResponse = await fetch('http://localhost:5050/users/playlists', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });

        if (!playlistResponse.ok) {
          throw new Error('플레이리스트를 불러올 수 없습니다.');
        }

        const playlistData = await playlistResponse.json();
        console.log('받은 플레이리스트 데이터:', playlistData);
        setPlaylists(playlistData);

      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className={styles.pageContainer}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className={styles.pageContainer}>
          <div className={styles.error}>{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.pageContainer}>
        <div className={styles.profileContent}>
          <div className={styles.profileHeader}>
            <div className={styles.profileImageWrapper}>
              <Image
                src="/images/example_userimage.svg"
                alt="User Profile"
                width={80}
                height={80}
                className={styles.profileImage}
                priority
              />
            </div>
            <MyProfile />
          </div>

          <div className={styles.contentSection}>
            <MyCardHeader
              totalPlaylists={playlists.length}
              totalVideos={playlists.reduce((sum, playlist) => sum + playlist.totalVideos, 0)}
            />
            <div className={styles.cardGrid}>
              {playlists.map((playlist) => (
                <MyCard
                  key={playlist.id}
                  id={playlist.id}
                  name={playlist.name}
                  totalVideos={playlist.totalVideos}
                  thumbnail={playlist.thumbnail}
                  previewVideos={playlist.previewVideos}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
