'use client';
import React, { useState, useEffect } from "react";
// style
import styles from "./Community.module.scss";

interface Memos {
  id: number;            // 메모 ID
  title: string;         // 메모 제목
  description: string;   // 메모 내용
  user: {
    id: number;          // 유저 ID
    nickname: string;    // 유저 닉네임
  }
  create_at: Date;       // 메모 생성 일자
  upadated_at: Date;     // 메모 수정 일자
}

export default function Community() {
  const [memos, setMemos] = useState<Memos[]>([]); // 모든 메모 저장
  const [filteredMemos, setFilteredMemos] = useState<Memos[]>([]); // 필터링된 메모
  const [viewMode, setViewMode] = useState<"all" | "mine">("all"); // 보기 모드
  const [selectedCard, setSelectedCard] = useState<Memos | null>(null); // 선택된 카드 상태

  const getVideoIdFromURL = () => {
    const path = window.location.pathname; // 현재 경로 가져오기
    const segments = path.split('/'); // 경로를 '/'로 분할
    return segments[segments.indexOf('vemo') + 1] || null; // 'vemo' 다음 경로 값 추출
  };
  
  const fetchMemos = async () => {
    try {
      const token = sessionStorage.getItem("token"); // 세션에서 토큰 가져오기
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const videoId = getVideoIdFromURL(); // videoId 추출
      if (!videoId) {
        alert("비디오 ID를 찾을 수 없습니다.");
        return;
      }

      const response = await fetch(`http://localhost:5050/video/${videoId}/community`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 토큰 헤더에 포함
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "데이터 요청 실패");
      }

      const data: Memos[] = await response.json();
      setMemos(data); // 서버에서 가져온 데이터를 저장
    } catch (error) {
      console.error("데이터 요청 실패:", error);
    }
  };

  useEffect(() => {
    fetchMemos(); // 컴포넌트 마운트 시 모든 메모 가져오기
  }, []);

  // 보기 모드 변경 시 필터링
  useEffect(() => {
    if (viewMode === "all") {
      setFilteredMemos(memos); // 모든 메모
    } else if (viewMode === "mine") {
      const userId = "user1"; // 현재 로그인된 사용자 ID
      setFilteredMemos(memos.filter((memo) => memo.author === userId));
    }
  }, [viewMode, memos]);

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
                </div>
                <div>
                  <p>작성자: {memo.user.nickname}</p>
                  <p>작성일: {new Date(memo.create_at).toLocaleString()}</p>
                  <p>수정일: {new Date(memo.upadated_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedCard(null)}>뒤로가기</button>
          <button>퍼가기</button>
          <h3>{selectedCard.title}</h3>
          <p>{selectedCard.description}</p>
          <p>작성자: {selectedCard.user.nickname}</p>
          <p>작성일: {new Date(selectedCard.create_at).toLocaleString()}</p>
          <p>수정일: {new Date(selectedCard.upadated_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}