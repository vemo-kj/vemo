'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Header from './components/Layout/Header';
import { CategorySection } from './components/category/CategorySection';
import MainCard from './components/mainCard/MainCard';
import styles from './page.module.css';
import { MainCardProps } from './types/MainCardProps';
import { Category, isValidCategory } from './types/category';

function SearchParamsComponent() {
    const searchParams = useSearchParams();
    const search = searchParams?.get('q') ?? '';
    const categoryParam = searchParams?.get('category') ?? 'All';

    const [mainCards, setMainCards] = useState<MainCardProps[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');

    // API
    const fetchMainCards = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('http://localhost:5050/home/cards', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            // const response = await fetch('http://43.203.85.223:5050/home', {
            //     method: 'GET',
            //     headers: { 'Content-Type': 'application/json' },
            // });

            if (!response.ok) {
                throw new Error(`Failed to fetch main cards: ${response.status}`);
            }

            const data = await response.json();

            if (!data || !Array.isArray(data.videos)) {
                throw new Error('Invalid data format received from server');
            }

            const formattedData: MainCardProps[] = data.videos.map((video: any) => ({
                id: String(video.id || ''),
                title: String(video.title || '제목 없음'),
                thumbnails: String(video.thumbnails || '/default-thumbnail.jpg'),
                duration: String(video.duration || '00:00'),
                category: String(video.category || 'Uncategorized'),
                channel: {
                    id: String(video.channel?.id || ''),
                    thumbnails: String(
                        video.channel?.thumbnails || '/default-channel-thumbnail.jpg',
                    ),
                    title: String(video.channel?.title || '채널명 없음'),
                },
                vemoCount: Number(video.vemoCount || 0),
            }));

            setMainCards(formattedData);
        } catch (error) {
            console.error('Error fetching main cards:', error);
            setError('데이터를 불러오는데 실패했습니다.');
            setMainCards([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMainCards();
    }, []);

    useEffect(() => {
        if (isValidCategory(categoryParam)) {
            setSelectedCategory(categoryParam);
        }
    }, [categoryParam]);

    const filteredCards = mainCards.filter(card => {
        const matchesCategory =
            selectedCategory === 'All' ||
            card.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = !search || card.title.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className={styles.mainContainer}>
            <div className={styles.content}>
                <CategorySection
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                />
                {isLoading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : (
                    <div className={styles.mainCardContainer}>
                        {filteredCards.map(card => (
                            <MainCard key={card.id} {...card} />
                        ))}
                    </div>
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
