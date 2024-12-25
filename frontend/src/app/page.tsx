'use client';

import Category from './components/category/Category';
import Header from './components/Layout/Header';
import MainCard from './components/mainCard/MainCard';
import styles from './page.module.css';
import { useState } from 'react';

export default function Home() {
    // 카테고리컴포넌트 props
    const categories = ['All', 'Education', 'Travel', 'Technology', 'Lifestyle', 'News'];
    const [selectedCategory, setSelectedCategory] = useState('All');

    // mainCard props
    // 데이터 기반 렌더링 되도록 작성해야함
    const mainCards = [
        {
            thumbnail: '1',
            mainCardTitle: '1',
            youtuberLogo: '1',
            youtuberProfile: '1',
            cardMemoCount: 1,
        },
    ];
    return (
        <main>
            <Category categories={categories} onCategorySelect={setSelectedCategory} />
            <div>
                {/* 추가 수정 필요 */}
                {mainCards.map((mainCard, index) => (
                    <MainCard key={index} {...mainCard} />
                ))}
            </div>
        </main>
    );
}
