'use client';

import { useState } from 'react';
import { useSummary } from '../../context/SummaryContext';

export default function QuizView() {
    const { quizData } = useSummary();
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
    const [showAnswers, setShowAnswers] = useState(false);

    if (!quizData) {
        return <div>퀴즈 데이터가 없습니다.</div>;
    }

    const handleAnswerSelect = (timestamp: string, answer: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [timestamp]: answer,
        }));
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">퀴즈</h2>
            <div className="space-y-6">
                {quizData.quizList.map((quiz, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                        <div className="font-semibold text-blue-600 mb-2">{quiz.timestamp}</div>
                        <p className="mb-3">{quiz.question}</p>
                        <div className="space-y-2">
                            <button
                                className={`w-full p-2 rounded ${
                                    selectedAnswers[quiz.timestamp] === 'O'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100'
                                }`}
                                onClick={() => handleAnswerSelect(quiz.timestamp, 'O')}
                            >
                                O
                            </button>
                            <button
                                className={`w-full p-2 rounded ${
                                    selectedAnswers[quiz.timestamp] === 'X'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100'
                                }`}
                                onClick={() => handleAnswerSelect(quiz.timestamp, 'X')}
                            >
                                X
                            </button>
                        </div>
                        {showAnswers && (
                            <div className="mt-3 text-green-600">
                                정답: {quiz.answer}
                                {selectedAnswers[quiz.timestamp] === quiz.answer ? (
                                    <span className="text-green-500 ml-2">✓ 정답</span>
                                ) : (
                                    <span className="text-red-500 ml-2">✗ 오답</span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => setShowAnswers(!showAnswers)}
            >
                {showAnswers ? '정답 숨기기' : '정답 확인하기'}
            </button>
        </div>
    );
}
