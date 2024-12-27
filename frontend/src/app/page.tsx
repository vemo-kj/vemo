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
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
    const categories = ['All', 'Education', 'Travel', 'Technology', 'Lifestyle'];
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [mainCards, setMainCards] = useState<MainCardProps[]>([]); // 서버에서 데이터를 받아 저장할 상태
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get('q') || '';

    // 서버에서 MainCard 데이터를 가져오는 함수
    const fetchMainCards = async () => {
        try {
        const response = await fetch('/api/mainCards'); // 백엔드 서버의 API 엔드포인트
        if (!response.ok) {
            throw new Error('Failed to fetch main cards');
        }
        const data: MainCardProps[] = await response.json();
        setMainCards(data); // 데이터를 상태에 저장
        } catch (error) {
        console.error('Error fetching main cards:', error);
        }
    };

    // 화면 로드 시 데이터를 가져옴
    useEffect(() => {
        fetchMainCards();
    }, []);

    // 카테고리 및 검색 조건에 따라 필터링된 카드를 반환
    const filteredCards = mainCards.filter((card) => {
        const matchesCategory =
        selectedCategory === 'All' || card.category === selectedCategory;

        const matchesSearch =
        search !== '' ? card.mainCardTitle.includes(search) : true;

        if (search !== '') {
        return matchesSearch;
        } else {
        return matchesCategory;
        }
    });

    // 카테고리 클릭 시 처리
    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);

        if (category === 'All') {
        router.push('/');
        } else {
        router.push(`/?category=${encodeURIComponent(category)}`);
        }
    };

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