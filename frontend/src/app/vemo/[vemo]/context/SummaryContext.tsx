import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// 요약 데이터 타입 정의
interface SummaryItem {
    id: number;
    timestamp: string;
    description: string;
}

interface SummaryData {
    summaryList: SummaryItem[];
}

// 퀴즈 데이터 타입 정의
interface QuizItem {
    timestamp: string;
    question: string;
    answer: string;
}

interface QuizData {
    quizList: QuizItem[];
}

// Context에서 관리할 값의 타입
interface SummaryContextType {
    summaryData: SummaryData | null; // 요약 데이터
    quizData: QuizData | null; // 퀴즈 데이터
    setSummaryData: (data: SummaryData) => void; // 요약 데이터 업데이트 함수
    setQuizData: (data: QuizData) => void; // 퀴즈 데이터 업데이트 함수
    resetData: () => void; // 데이터 초기화 함수
}

// Context 생성
const SummaryContext = createContext<SummaryContextType>({
    summaryData: null,
    quizData: null,
    setSummaryData: () => { },
    setQuizData: () => { },
    resetData: () => { },
});

// Provider 컴포넌트 생성
export const SummaryProvider = ({ children }: { children: ReactNode }) => {
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [quizData, setQuizData] = useState<QuizData | null>(null);

    // 데이터 초기화 함수 추가
    const resetData = useCallback(() => {
        setSummaryData(null);
        setQuizData(null);
    }, []);

    return (
        <SummaryContext.Provider
            value={{
                summaryData,
                quizData,
                setSummaryData,
                setQuizData,
                resetData  // 초기화 함수 추가
            }}
        >
            {children}
        </SummaryContext.Provider>
    );
};

// Context를 쉽게 사용할 수 있는 Hook 생성
export const useSummary = () => {
    try {
        const context = useContext(SummaryContext);
        if (!context) {
            console.warn('useSummary was called outside of SummaryProvider');
            return {
                summaryData: null,
                quizData: null,
                setSummaryData: () => { },
                setQuizData: () => { },
                resetData: () => { },
            };
        }
        return context;
    } catch (error) {
        console.warn('Error using SummaryContext:', error);
        return {
            summaryData: null,
            quizData: null,
            setSummaryData: () => { },
            setQuizData: () => { },
            resetData: () => { },
        };
    }
};
