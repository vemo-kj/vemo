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
  totalDuration: string;
  thumbnail: string;
  previewVideos: Array<{
    id: string;
    title: string;
    channel: string;
    thumbnail: string;
    duration: string;
  }>;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  nickname: string;
  birth: string;
  gender: string;
  profileImage: string;
  introduction: string;
}

// 더미 데이터
const dummyPlaylists: PlaylistResponse[] = [
  {
    id: 1,
    name: "알고리즘 강의 모음",
    totalVideos: 5,
    totalDuration: "2시간 45분",
    thumbnail: "https://i.ytimg.com/vi/abc123/maxresdefault.jpg",
    previewVideos: [
      {
        id: "video1",
        title: "정렬 알고리즘의 이해",
        channel: "코딩 마스터",
        thumbnail: "https://i.ytimg.com/vi/abc123/maxresdefault.jpg",
        duration: "32:10"
      },
      {
        id: "video2",
        title: "그래프 알고리즘 기초",
        channel: "알고리즘 학습",
        thumbnail: "https://i.ytimg.com/vi/def456/maxresdefault.jpg",
        duration: "45:22"
      },
      {
        id: "video3",
        title: "동적 프로그래밍 입문",
        channel: "알고리즘 학습",
        thumbnail: "https://i.ytimg.com/vi/ghi789/maxresdefault.jpg",
        duration: "38:15"
      }
    ]
  },
  {
    id: 2,
    name: "웹 개발 튜토리얼",
    totalVideos: 3,
    totalDuration: "1시간 30분",
    thumbnail: "https://i.ytimg.com/vi/xyz789/maxresdefault.jpg",
    previewVideos: [
      {
        id: "video3",
        title: "React 기초 배우기",
        channel: "프론트엔드 개발자",
        thumbnail: "https://i.ytimg.com/vi/xyz789/maxresdefault.jpg",
        duration: "28:45"
      },
      {
        id: "video4",
        title: "Next.js 실전 프로젝트",
        channel: "웹 개발 강의",
        thumbnail: "https://i.ytimg.com/vi/pqr456/maxresdefault.jpg",
        duration: "42:15"
      },
      {
        id: "video5",
        title: "TypeScript 완벽 가이드",
        channel: "웹 개발 강의",
        thumbnail: "https://i.ytimg.com/vi/stu789/maxresdefault.jpg",
        duration: "35:30"
      }
    ]
  }
];

export default function MyPage() {
  const [playlists, setPlaylists] = useState<PlaylistResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMemos, setTotalMemos] = useState<number>(0);

  const calculateTotalMemos = async () => {
    try {
      const accessToken = sessionStorage.getItem('token');
      if (!accessToken) {
        return 0;
      }

      const response = await fetch('http://localhost:5050/vemo/memo/count', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('메모 수 가져오기 실패:', error);
      return 0;
    }
  };

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
        setPlaylists(playlistData);

        const memoCount = await calculateTotalMemos();
        setTotalMemos(memoCount);

      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
            <MyCardHeader
              totalPlaylists={dummyPlaylists.length}
              totalVideos={dummyPlaylists.reduce((sum, playlist) => sum + playlist.totalVideos, 0)}
            />
            <div className={styles.cardGrid}>
              {dummyPlaylists.map((playlist) => (
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
  )
}
