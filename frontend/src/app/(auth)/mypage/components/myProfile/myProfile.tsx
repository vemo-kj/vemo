'use client'
import { useState, useEffect } from 'react';
import styles from './myProfile.module.css';

type UserProfile = {
  nickname: string;
  description: string;
};

export default function MyProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile({
          nickname: data.nickname,
          description: data.description,
        });
      } catch (err) {
        setError('프로필 정보를 가져오는데 실패했습니다.');
        console.error(err);
      }
    }

    fetchProfile();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!profile) {
    return <div>Loading...</div>;
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
