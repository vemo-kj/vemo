import React, { createContext, useContext, useState, ReactNode } from 'react';

// 요약 데이터의 타입 정의
interface SummaryData {
  timeStamp: string;
  description: string;
  quizTimeStamp: string;
  quiz: string;
}

// Context에서 관리할 값의 타입
interface SummaryContextType {
  summaryData: SummaryData | null; // 저장된 데이터
  setSummaryData: (data: SummaryData) => void; // 데이터 업데이트 함수
}

// Context 생성
const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

// Provider 컴포넌트 생성
export const SummaryProvider = ({ children }: { children: ReactNode }) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  return (
    <SummaryContext.Provider value={{ summaryData, setSummaryData }}>
      {children}
    </SummaryContext.Provider>
  );
};

// Context를 쉽게 사용할 수 있는 Hook 생성
export const useSummary = () => {
  const context = useContext(SummaryContext);
  if (!context) {
    throw new Error('useSummary must be used within a SummaryProvider');
  }
  return context;
};