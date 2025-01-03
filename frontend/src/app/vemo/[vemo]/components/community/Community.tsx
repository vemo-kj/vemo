'use client';

import React, { useState, useEffect } from 'react';
// style
import styles from './Community.module.css';

interface Memos {
  id: number; // 메모 ID
  title: string; // 메모 제목
  description: string; // 메모 내용
  user: {
    id: number; // 유저 ID
    nickname: string; // 유저 닉네임
  };
  create_at: Date; // 메모 생성 일자
  updated_at: Date; // 메모 수정 일자
}

export default function Community() {
  const [memos, setMemos] = useState<Memos[]>([]); // 메모 리스트
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all'); // 보기 모드
  const [selectedCard, setSelectedCard] = useState<Memos | null>(null); // 선택된 카드 상태

  // const getVideoIdFromURL = () => {
  //   const path = window.location.pathname; // 현재 경로 가져오기
  //   const segments = path.split('/'); // 경로를 '/'로 분할
  //   return segments[segments.indexOf('vemo') + 1] || null; // 'vemo' 다음 경로 값 추출
  // };
  const getVideoIdFromURL = () => {
    try {
      // 현재 전체 URL을 가져옴
      const currentUrl = window.location.href;
      const url = new URL(currentUrl);
      
      // pathname에서 videoId 추출 (/vemo/videoId)
      const pathSegments = url.pathname.split('/');
      const videoId = pathSegments[pathSegments.length - 1];
      
      return videoId || null;
    } catch (error) {
      console.error('URL 파싱 에러:', error);
      return null;
    }
  };

  const fetchMemos = async (filter: 'all' | 'mine' = 'all') => {
    try {
      const token = sessionStorage.getItem('token'); // 세션에서 토큰 가져오기
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const videoId = getVideoIdFromURL(); // videoId 추출
      if (!videoId) {
        alert('비디오 ID를 찾을 수 없습니다.');
        return;
      }

      // API 요청 URL 구성
      const apiUrl = new URL(`http://localhost:5050/video/${videoId}/community`);
      if (filter === 'mine') {
        apiUrl.searchParams.append('filter', 'mine');
      }

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // 토큰 헤더에 포함
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '데이터 요청 실패');
      }

      const data: Memos[] = await response.json();
      setMemos(data); // 서버에서 가져온 데이터를 저장
    } catch (error) {
      console.error('데이터 요청 실패:', error);
    }
  };

  useEffect(() => {
    fetchMemos(); // 컴포넌트 마운트 시 전체 메모 가져오기
  }, []);

  const handleViewModeChange = (mode: 'all' | 'mine') => {
    setViewMode(mode);
    fetchMemos(mode); // 보기 모드에 따라 API 요청
  };

  const handleCardSelect = (memo: Memos) => {
    setSelectedCard(memo);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Community</h1>
        <div className={styles.buttonContainer}>
          <button 
            className={`${styles.viewButton} ${viewMode === 'all' ? styles.active : ''}`}
            onClick={() => handleViewModeChange('all')}
          >
            전체보기
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === 'mine' ? styles.active : ''}`}
            onClick={() => handleViewModeChange('mine')}
          >
            내글보기
          </button>
        </div>
      </div>

      {!selectedCard ? (
        <div className={styles.memoList}>
          {memos.map((memo) => (
            <div
              key={memo.id}
              className={styles.memoCard}
              onClick={() => handleCardSelect(memo)}
            >
              <div className={styles.memoContent}>
                <h3 className={styles.memoTitle}>{memo.title}</h3>
                <p className={styles.memoDescription}>{memo.description}</p>
              </div>
              <div className={styles.memoInfo}>
                <span className={styles.author}>{memo.user.nickname}</span>
                <div className={styles.dateInfo}>
                  <span className={styles.date}>
                    작성: {new Date(memo.create_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.detailView}>
          <div className={styles.detailHeader}>
            <button 
              className={styles.backButton}
              onClick={() => setSelectedCard(null)}
            >
              뒤로가기
            </button>
            <button className={styles.shareButton}>퍼가기</button>
          </div>
          <div className={styles.detailContent}>
            <h3 className={styles.detailTitle}>{selectedCard.title}</h3>
            <p className={styles.detailDescription}>{selectedCard.description}</p>
            <div className={styles.detailInfo}>
              <span className={styles.author}>{selectedCard.user.nickname}</span>
              <div className={styles.dateInfo}>
                <span className={styles.date}>
                  작성: {new Date(selectedCard.create_at).toLocaleDateString()}
                </span>
                <span className={styles.date}>
                  수정: {new Date(selectedCard.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
