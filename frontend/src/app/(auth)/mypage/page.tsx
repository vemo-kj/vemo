'use client'
import { useState, useEffect } from 'react';
import Header from '../../components/Layout/Header'
import MyCard from "./components/mycard/MyCard"
import MyCardHeader from '../mypage/components/myCardHeader/MyCardHeader'
import MyProfile from './components/myProfile/myProfile'
import styles from './MyPage.module.css'
import Image from 'next/image'

interface Playlist {
  id: string;
  thumbnail: string;
  title: string;
  totalVideos: number;
  totalMemos: number;
  youtubeLink: string;
}

export default function MyPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    async function fetchPlaylists() {
      const accessToken = sessionStorage.getItem('token');
      if (!accessToken) return;

      try {
        const response = await fetch('http://localhost:5050/vemo/playlists', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch playlists');

        const data = await response.json();
        setPlaylists(data);
      } catch (error) {
        console.error('플레이리스트 가져오기 실패:', error);
      }
    }

    fetchPlaylists();
  }, []);

  return (
    <>
      <Header />
      <div className={styles.pageContainer}>
        <div className={styles.banner}>
          <div className={styles.waveBg}></div>
        </div>

        <div className={styles.profileContent}>
          <div className={styles.profileHeader}>
            <div className={styles.profileImageWrapper}>
              <Image
                src="/images/example_userimage.svg"
                alt="User Profile"
                width={120}
                height={120}
                className={styles.profileImage}
                priority
              />
            </div>

            <MyProfile />
          </div>

          <div className={styles.contentSection}>
            <MyCardHeader />
            <div className={styles.cardGrid}>
              {playlists.map((playlist) => (
                <MyCard
                  key={playlist.id}
                  thumbnail={playlist.thumbnail}
                  playlistTitle={playlist.title}
                  totalVideos={playlist.totalVideos}
                  totalMemos={playlist.totalMemos}
                  youtubeLink={playlist.youtubeLink}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
