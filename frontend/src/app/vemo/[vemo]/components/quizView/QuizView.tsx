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

    console.log('퀴즈 데이터:', quizData); // 데이터 확인용 로그

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
                    <div key={index} className="border p-4 rounded-lg shadow-sm">
                        <div className="font-semibold text-blue-600 mb-2">{quiz.timestamp}</div>
                        <div className="mb-4">
                            <p className="text-lg font-medium text-gray-800 whitespace-pre-wrap">
                                {quiz.question}
                            </p>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                className={`w-16 h-16 rounded-full text-xl font-bold transition-all ${
                                    selectedAnswers[quiz.timestamp] === 'O'
                                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                                }`}
                                onClick={() => handleAnswerSelect(quiz.timestamp, 'O')}
                            >
                                O
                            </button>
                            <button
                                className={`w-16 h-16 rounded-full text-xl font-bold transition-all ${
                                    selectedAnswers[quiz.timestamp] === 'X'
                                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                                }`}
                                onClick={() => handleAnswerSelect(quiz.timestamp, 'X')}
                            >
                                X
                            </button>
                        </div>
                        {showAnswers && (
                            <div className="mt-4 text-center">
                                <div
                                    className={`inline-block px-4 py-2 rounded ${
                                        selectedAnswers[quiz.timestamp] === quiz.answer
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {selectedAnswers[quiz.timestamp] === quiz.answer ? (
                                        <span>정답입니다! ✓</span>
                                    ) : (
                                        <span>오답입니다. 정답은 {quiz.answer}입니다 ✗</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button
                className="mt-6 w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                onClick={() => setShowAnswers(!showAnswers)}
            >
                {showAnswers ? '정답 숨기기' : '정답 확인하기'}
            </button>
        </div>
    );
}
