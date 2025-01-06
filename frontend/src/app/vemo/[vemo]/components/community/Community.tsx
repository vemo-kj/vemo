'use client';

import React, { useState, useEffect } from 'react';
import styles from './Community.module.css';

interface Memos {
  id: number;
  title: string;
  description: string;
  user: {
    id: number;
    nickname: string;
  };
  created_at: Date;
  updated_at: Date;
}

interface CommunityResponse {
  memos: Memos[];
}

export default function Community() {
  const [memos, setMemos] = useState<Memos[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [selectedCard, setSelectedCard] = useState<Memos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getVideoIdFromURL = () => {
    try {
      const currentUrl = window.location.href;
      const url = new URL(currentUrl);
      const pathSegments = url.pathname.split('/');
      const videoId = pathSegments[pathSegments.length - 1];
      return videoId ? videoId.split('?')[0] : null;
    } catch (error) {
      console.error('URL 파싱 에러:', error);
      return null;
    }
  };

  const fetchMemos = async (filter: 'all' | 'mine' = 'all') => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const videoId = getVideoIdFromURL();
      if (!videoId) {
        setError('비디오 ID를 찾을 수 없습니다.');
        return;
      }

      console.log('요청 정보:', {
        videoId,
        filter,
        token: token.substring(0, 10) + '...'
      });

      // filter 파라미터를 명시적으로 추가
      const apiUrl = `http://localhost:5050/vemo/video/${videoId}/community?filter=${filter}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '데이터 요청 실패');
      }

      const responseData = await response.json();
      console.log('서버 응답:', responseData);

      // 백엔드 응답 구조에 맞게 데이터 설정
      if (responseData && responseData.memos) {
        setMemos(responseData.memos);
      } else {
        setMemos([]);
      }
      setError(null);

    } catch (error) {
      console.error('데이터 요청 실패:', error);
      setError(error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos(viewMode);
  }, [viewMode]);

  const handleViewModeChange = (mode: 'all' | 'mine') => {
    setViewMode(mode);
  };

  const handleCardSelect = (memo: Memos) => {
    setSelectedCard(memo);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Community</h1>
        {error && <div className={styles.error}>{error}</div>}
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

      {isLoading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : !selectedCard ? (
        <div className={styles.memoList}>
          {memos.length === 0 ? (
            <div className={styles.noContent}>
              {viewMode === 'all' ? '작성된 글이 없습니다.' : '작성한 글이 없습니다.'}
            </div>
          ) : (
            memos.map((memo) => (
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
                      작성: {new Date(memo.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
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
                  작성: {new Date(selectedCard.created_at).toLocaleDateString()}
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
