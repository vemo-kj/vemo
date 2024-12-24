'use client';
//style
import styles from './page.module.css';
//component
import Category from './components/category/Category';
import Header from './components/Layout/Header';
import MainCard from './components/mainCard/MainCard';
//type
import { MainCardProps } from './types/MainCardProps';
//next
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 임시 데이터
const mainCards: MainCardProps[] = [
    {
        thumbnail: '1',
        mainCardTitle: 'React Basics',
        youtuberLogo: '1',
        youtuberProfile: 'React Channel',
        cardMemoCount: 5,
        category: 'Education',
        youtubeLink: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
    },
    {
        thumbnail: '2',
        mainCardTitle: 'Next.js Guide',
        youtuberLogo: '2',
        youtuberProfile: 'Next.js Channel',
        cardMemoCount: 8,
        category: 'Technology',
        youtubeLink: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
    },
    {
        thumbnail: '3',
        mainCardTitle: 'Travel Vlog',
        youtuberLogo: '3',
        youtuberProfile: 'Travel Channel',
        cardMemoCount: 3,
        category: 'Travel',
        youtubeLink: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
    },
    {
        thumbnail: '4',
        mainCardTitle: 'Healthy Living',
        youtuberLogo: '4',
        youtuberProfile: 'Lifestyle Channel',
        cardMemoCount: 6,
        category: 'Lifestyle',
        youtubeLink: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
    },
    ];

    export default function Home() {
    const categories = ['All', 'Education', 'Travel', 'Technology', 'Lifestyle'];
    const [selectedCategory, setSelectedCategory] = useState('All');
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get('q') || '';

    // 카테고리 버튼 클릭 핸들러
    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);

        // URL에서 `q` 파라미터를 제거하고 카테고리 필터링 적용
        if (category === 'All') {
        router.push('/'); // 모든 카테고리 표시
        } else {
        router.push(`/?category=${encodeURIComponent(category)}`);
        }
    };

    // 필터링된 카드 계산
    const filteredCards = mainCards.filter((card) => {
        const matchesCategory =
        selectedCategory === 'All' || card.category === selectedCategory;

        const matchesSearch = search !== '' ? card.mainCardTitle.includes(search) : true;

        // 검색 중이면 검색 필터만 적용, 그렇지 않으면 카테고리 필터 적용
        if (search !== '') {
        return matchesSearch;
        } else {
        return matchesCategory;
        }
    });

    return (
        <main>
        <Header />
        <Category categories={categories} onCategorySelect={handleCategoryClick} />
        <div className={styles.mainCardContainer}>
            {filteredCards.map((mainCard, index) => (
            <MainCard key={index} {...mainCard} />
            ))}
        </div>
        </main>
    );
    }