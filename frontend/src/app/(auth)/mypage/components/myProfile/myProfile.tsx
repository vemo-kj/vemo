'use client'
import { useState, useEffect } from 'react';
import styles from './myProfile.module.css';
import Image from 'next/image';

type UserProfile = {
  nickname: string;
  birth: string;
  gender: string;
  profileImage?: string;
  introduction?: string;
}

export default function MyProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = sessionStorage.getItem('token');
        if (!accessToken) {
          setError('로그인이 필요합니다');
          return;
        }

        console.log('토큰:', accessToken);

        const response = await fetch('http://localhost:5050/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        console.log('응답 상태:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('에러 응답:', errorText);
          throw new Error('프로필을 불러올 수 없습니다.');
        }

        const data = await response.json();
        console.log('받은 프로필 데이터:', data);

        if (!data.id || !data.name || !data.email) {
          console.error('잘못된 데이터 구조:', data);
          throw new Error('잘못된 프로필 데이터 형식');
        }

        setProfile(data);
      } catch (error) {
        console.error('프로필 로딩 실패:', error);
        setError('프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (isLoading || !profile) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1>닉네임{profile.nickname}</h1>
        <button>Edit Profile</button>
      </div>
      <p>자기소개{profile.description}</p>
    </div>
  );
}
