'use client';

import { useState } from 'react';
import { useSummary } from '../../context/SummaryContext';
import styles from './quizView.module.css';

interface QuizViewProps {
    onTimestampClick?: (timestamp: string) => void;
}

interface QuizAnswer {
    selected: 'O' | 'X' | null;
    isCorrect?: boolean;
}

interface QuizAnswers {
    [quizId: number]: QuizAnswer;
}

export default function QuizView({ onTimestampClick }: QuizViewProps) {
    const { quizData } = useSummary();
    const [answers, setAnswers] = useState<QuizAnswers>({});
    const [showAnswers, setShowAnswers] = useState(false);

    if (!quizData) {
        return <div className={styles.noData}>퀴즈 데이터가 없습니다. 요약하기 버튼을 눌러주세요.</div>;
    }

    const handleTimestampClick = (timestamp: string) => {
        if (onTimestampClick) {
            onTimestampClick(timestamp);
        }
    };

    const handleAnswerSelect = (index: number, answer: 'O' | 'X') => {
        setAnswers(prev => ({
            ...prev,
            [index]: {
                selected: answer,
                isCorrect: showAnswers ? answer === quizData.quizList[index].answer : undefined
            }
        }));
    };

    const toggleShowAnswers = () => {
        setShowAnswers(prev => {
            const newShowAnswers = !prev;
            if (newShowAnswers) {
                // 정답을 보여줄 때 현재 선택된 답안들의 정오답 여부를 계산
                const updatedAnswers = { ...answers };
                quizData.quizList.forEach((quiz, index) => {
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

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>퀴즈</h2>
            <div className={styles.quizList}>
                {quizData.quizList.map((quiz, index) => (
                    <div key={index} className={styles.quizItem}>
                        <div
                            className={styles.timestamp}
                            onClick={() => handleTimestampClick(quiz.timestamp)}
                            style={{ cursor: 'pointer' }}
                        >
                            {quiz.timestamp}
                        </div>
                        <div className={styles.question}>{quiz.question}</div>
                        <div className={styles.answerButtons}>
                            <button
                                className={`${styles.answerButton} ${answers[index]?.selected === 'O' ? styles.selected : ''
                                    }`}
                                onClick={() => handleAnswerSelect(index, 'O')}
                            >
                                O
                            </button>
                            <button
                                className={`${styles.answerButton} ${answers[index]?.selected === 'X' ? styles.selected : ''
                                    }`}
                                onClick={() => handleAnswerSelect(index, 'X')}
                            >
                                X
                            </button>
                        </div>
                        {showAnswers && answers[index]?.selected && (
                            <div className={`${styles.result} ${answers[index].isCorrect ? styles.correct : styles.incorrect
                                }`}>
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
