'use client';

import styles from './page.module.css';
import Header from './components/Layout/Header';
import MainCard from './components/mainCard/MainCard';
import { CategorySection } from './components/category/CategorySection';
import { MainCardProps } from './types/MainCardProps';
import { Category, isValidCategory } from './types/category';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

function SearchParamsComponent() {
    const [mainCards, setMainCards] = useState<MainCardProps[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const search = searchParams?.get('q') ?? '';
    const categoryParam = searchParams?.get('category') ?? 'All';
    const mainContainerRef = useRef<HTMLDivElement>(null);

    const fetchCards = async (pageNum: number) => {
        if (isLoading || !hasMore) return;
        try {
            setIsLoading(true);
            console.log(`Fetching page ${pageNum}...`);

            const token = localStorage.getItem('accessToken');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/home?page=${pageNum}&limit=12`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();

            requestAnimationFrame(() => {
                setMainCards(prev => [...prev, ...data.videos]);
                setHasMore(data.hasMore);
                setPage(prev => prev + 1);
            });

        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 카테고리나 검색어 변경 시 전체 데이터 조회
    const fetchAllCards = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/home/all`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            setMainCards(data.videos);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // 초기 데이터 로드
    useEffect(() => {
        if (!search && categoryParam === 'All') {
            setMainCards([]); // 상태 초기화
            setPage(1);      // 페이지 초기화
            setHasMore(true); // hasMore 초기화
            fetchCards(1);
        }
    }, [search, categoryParam]);

    // 스크롤 이벤트 처리
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            // 디바운스 처리
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const scrollPosition = window.innerHeight + window.scrollY;
                const threshold = document.documentElement.scrollHeight - 100;

                if (
                    scrollPosition >= threshold &&
                    !isLoading &&
                    hasMore &&
                    !search &&
                    categoryParam === 'All'
                ) {
                    fetchCards(page);
                }
            }, 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [page, hasMore, isLoading, search, categoryParam]);

    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');

    const filteredCards = mainCards.filter(card => {
        const matchesCategory =
            selectedCategory === 'All' ||
            card.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = !search || card.title.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className={styles.mainContainer} ref={mainContainerRef}>
            <div className={styles.content}>
                <CategorySection
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                />
                <div className={styles.mainCardContainer}>
                    {filteredCards.map((card, index) => (
                        <MainCard
                            key={`${card.id}-${index}`}
                            {...card}
                        />
                    ))}
                </div>
                {isLoading && (
                    <div className={styles.loading}>Loading...</div>
                )}
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <>
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
                <SearchParamsComponent />
            </Suspense>
        </>
    );
}
