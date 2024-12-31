'use client';
import React, { useState, useEffect } from "react";
// style
import styles from "./Community.module.scss";
import ExtractButton from '../ExtractButton/ExtractButton'

interface Memo {
  id: string; // 메모 ID
  title: string;
  description: string;
  author: string;
  date: string;
  vemoCount: number;
}


export default function Community() {
  const [memos, setMemos] = useState<Memo[]>([]); // 모든 메모 저장
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]); // 필터링된 메모
  const [viewMode, setViewMode] = useState<"all" | "mine">("all"); // 보기 모드
  const [selectedCard, setSelectedCard] = useState<Memo | null>(null); // 선택된 카드 상태



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
            <ExtractButton />
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

