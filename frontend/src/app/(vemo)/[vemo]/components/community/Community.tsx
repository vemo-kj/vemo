'use client';
import React, { useState, useEffect } from "react";
// style
import styles from "./Community.module.scss";

interface Memo {
  id: string; // 메모 ID
  title: string;
  description: string;
  author: string;
  date: string;
  vemoCount: number;
}

const DUMMY_MEMOS: Memo[] = [
  {
    id: "1",
    title: "자바스크립트 기초",
    description: "자바스크립트 변수와 함수에 대한 간단한 설명",
    author: "user1",
    date: "2024-12-29",
    vemoCount: 10,
  },
  {
    id: "2",
    title: "리액트 훅 사용법",
    description: "useState와 useEffect의 기본 사용법을 다룹니다.",
    author: "user2",
    date: "2024-12-28",
    vemoCount: 7,
  },
  {
    id: "3",
    title: "비동기 처리의 이해",
    description: "Promise와 async/await에 대해 알아봅니다.",
    author: "user1",
    date: "2024-12-27",
    vemoCount: 15,
  },
  {
    id: "4",
    title: "CSS Flexbox 정리",
    description: "Flexbox 레이아웃의 핵심 개념을 설명합니다.",
    author: "user3",
    date: "2024-12-26",
    vemoCount: 5,
  },
];

export default function Community() {
  const [memos, setMemos] = useState<Memo[]>([]); // 모든 메모 저장
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]); // 필터링된 메모
  const [viewMode, setViewMode] = useState<"all" | "mine">("all"); // 보기 모드
  const [selectedCard, setSelectedCard] = useState<Memo | null>(null); // 선택된 카드 상태

  // 더미 데이터를 로드
  useEffect(() => {
    setMemos(DUMMY_MEMOS); // 더미 데이터를 상태로 설정
    setFilteredMemos(DUMMY_MEMOS); // 초기에는 모든 메모를 표시
  }, []);

  // 보기 모드에 따른 필터링
  useEffect(() => {
    if (viewMode === "all") {
      setFilteredMemos(memos); // 모든 메모
    } else if (viewMode === "mine") {
      const userId = "user1"; // 현재 로그인된 사용자 ID
      setFilteredMemos(memos.filter((memo) => memo.author === userId));
    }
  }, [viewMode, memos]);

  const handleCardSelect = (memo: Memo) => {
    setSelectedCard(memo);
  };

  return (
    <div>
      <h1>Community</h1>
      {!selectedCard ? (
        <>
          <div>
            <button onClick={() => setViewMode("all")}>전체보기</button>
            <button onClick={() => setViewMode("mine")}>내글보기</button>
          </div>
          <div>
            {filteredMemos.map((memo) => (
              <div
                key={memo.id}
                onClick={() => handleCardSelect(memo)}
                style={{
                  border: "1px solid #ccc",
                  margin: "10px 0",
                  padding: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                <div>
                  <h3>{memo.title}</h3>
                  <p>{memo.description}</p>
                </div>
                <div>
                  <p>작성자: {memo.author}</p>
                  <p>작성일: {memo.date}</p>
                  <p>베모 카운트: {memo.vemoCount}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setSelectedCard(null)}>뒤로가기</button>
          <button>퍼가기</button>
          <h3>{selectedCard.title}</h3>
          <p>{selectedCard.description}</p>
          <p>작성자: {selectedCard.author}</p>
          <p>작성일: {selectedCard.date}</p>
          <p>베모 카운트: {selectedCard.vemoCount}</p>
        </div>
      )}
    </div>
  );
}