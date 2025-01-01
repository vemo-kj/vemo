'use client'
//next
import { useEffect, useState } from 'react';
//styles
import styles from './MyCardHeader.module.css';
//utils
import { fetchUserMemoCount } from '@/app/api/fetchUserMemoCount';
//components
import MyCardHeaderButton from '../myCardHeaderButton.tsx/MyCardHeaderButton';

export default function MyCardHeader() {
  const [userMemoCount, setUserMemoCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 메모 개수 API 호출
  useEffect(() => {
    async function loadMemoCount() {
      const count = await fetchUserMemoCount();
      setUserMemoCount(count);
      setLoading(false);
    }
    loadMemoCount();
  }, []);

  const handleAllClick = () => {
    console.log('All 버튼 클릭됨');
  };

  const handleStudyingClick = () => {
    console.log('Studying 버튼 클릭됨');
  };

  return (
    <div>
      <div>
        <h2>나의 VEMO 모아보기</h2>
        {loading ? (
          <span className={styles.userMemoCount}>로딩 중...</span>
        ) : (
          <span className={styles.userMemoCount}>
            {userMemoCount !== null ? `총 ${userMemoCount}개` : '데이터를 불러오지 못했습니다.'}
          </span>
        )}
      </div>

      <div>
        <MyCardHeaderButton
          className={styles.AllButton}
          text="All" 
          onClick={handleAllClick}/>
        <MyCardHeaderButton
          className={styles.studyingButton}
          text="Studying"
          onClick={handleStudyingClick}/>
      </div>
    </div>
  );
}