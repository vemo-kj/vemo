'use client';

import { useState, useEffect } from 'react';
import styles from './Quiz.module.css';

interface Quiz {
  timestamp: string;
  question: string;
  answer: 'O' | 'X';
}

interface QuizAnswer {
  selected: 'O' | 'X' | null;
  isCorrect?: boolean;
}

interface QuizAnswers {
  [quizId: number]: QuizAnswer;
}

export default function QuizPage() {
  const [quizData, setQuizData] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 하드코딩된 비디오 ID로 퀴즈 데이터 가져오기
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const videoId = "4-JBG_AZtT0"; // 여기에 특정 비디오 ID 입력
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoId }),
        });

        if (!response.ok) {
          throw new Error('퀴즈 데이터를 가져오는데 실패했습니다.');
        }

        const data = await response.json();
        setQuizData(data);
      } catch (error) {
        console.error('퀴즈 로딩 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  const handleAnswerSelect = (index: number, answer: 'O' | 'X') => {
    setAnswers(prev => ({
      ...prev,
      [index]: {
        selected: answer,
        isCorrect: showAnswers ? answer === quizData[index].answer : undefined
      }
    }));
  };

  const toggleShowAnswers = () => {
    setShowAnswers(prev => {
      const newShowAnswers = !prev;
      if (newShowAnswers) {
        const updatedAnswers = { ...answers };
        quizData.forEach((quiz, index) => {
          if (updatedAnswers[index]?.selected) {
            updatedAnswers[index] = {
              ...updatedAnswers[index],
              isCorrect: updatedAnswers[index].selected === quiz.answer
            };
          }
        });
        setAnswers(updatedAnswers);
      }
      return newShowAnswers;
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>이벤트 퀴즈</h2>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>퀴즈를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!quizData || quizData.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>이벤트 퀴즈</h2>
        <div className={styles.loadingContainer}>
          <p>퀴즈 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>이벤트 퀴즈</h2>
      <div className={styles.quizList}>
        {quizData.map((quiz, index) => (
          <div key={index} className={styles.quizItem}>
            <div className={styles.question}>{quiz.question}</div>
            <div className={styles.answerButtons}>
              <button
                className={`${styles.answerButton} ${answers[index]?.selected === 'O' ? styles.selected : ''}`}
                onClick={() => handleAnswerSelect(index, 'O')}
              >
                O
              </button>
              <button
                className={`${styles.answerButton} ${answers[index]?.selected === 'X' ? styles.selected : ''}`}
                onClick={() => handleAnswerSelect(index, 'X')}
              >
                X
              </button>
            </div>
            {showAnswers && answers[index]?.selected && (
              <div className={`${styles.result} ${answers[index].isCorrect ? styles.correct : styles.incorrect}`}>
                {answers[index].isCorrect ? (
                  <span>정답입니다! ✓</span>
                ) : (
                  <span>오답입니다. 정답은 {quiz.answer}입니다 ✗</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        className={styles.checkAnswerButton}
        onClick={toggleShowAnswers}
      >
        {showAnswers ? '정답 숨기기' : '정답 확인하기'}
      </button>
    </div>
  );
}
