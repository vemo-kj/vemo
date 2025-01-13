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
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showCheckButton, setShowCheckButton] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const videoId = "4-JBG_AZtT0";
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

    // 답을 선택하면 잠시 후 다음 문제로 넘어감
    setTimeout(() => {
      if (index === quizData.length - 1) {
        setShowCheckButton(true);
      } else {
        setCurrentQuizIndex(prev => prev + 1);
      }
    }, 500);
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
        // 모든 퀴즈 표시
        setCurrentQuizIndex(quizData.length);
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
        {showAnswers ? (
          // 정답 확인 시 모든 문제 표시
          <div className={styles.answersGrid}>
            {quizData.map((quiz, index) => (
              <div
                key={index}
                className={`${styles.quizItem} ${styles.showAnswer}`}
              >
                <div className={styles.question}>{quiz.question}</div>
                <div className={styles.answerButtons}>
                  <button
                    className={`${styles.answerButton} ${answers[index]?.selected === 'O' ? styles.selected : ''}`}
                    disabled
                  >
                    O
                  </button>
                  <button
                    className={`${styles.answerButton} ${answers[index]?.selected === 'X' ? styles.selected : ''}`}
                    disabled
                  >
                    X
                  </button>
                </div>
                {answers[index]?.selected && (
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
        ) : (
          // 퀴즈 진행 중에는 현재 문제만 표시
          <div className={`${styles.quizItem} ${styles.slideIn}`}>
            <div className={styles.question}>{quizData[currentQuizIndex].question}</div>
            <div className={styles.answerButtons}>
              <button
                className={`${styles.answerButton} ${answers[currentQuizIndex]?.selected === 'O' ? styles.selected : ''}`}
                onClick={() => !answers[currentQuizIndex] && handleAnswerSelect(currentQuizIndex, 'O')}
                disabled={!!answers[currentQuizIndex]}
              >
                O
              </button>
              <button
                className={`${styles.answerButton} ${answers[currentQuizIndex]?.selected === 'X' ? styles.selected : ''}`}
                onClick={() => !answers[currentQuizIndex] && handleAnswerSelect(currentQuizIndex, 'X')}
                disabled={!!answers[currentQuizIndex]}
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>
      {showCheckButton && !showAnswers && (
        <button
          className={`${styles.checkAnswerButton} ${styles.fadeIn}`}
          onClick={toggleShowAnswers}
        >
          정답 확인하기
        </button>
      )}
      {showAnswers && (
        <button
          className={`${styles.checkAnswerButton} ${styles.fadeIn}`}
          onClick={toggleShowAnswers}
        >
          다시 풀기
        </button>
      )}
    </div>
  );
}
