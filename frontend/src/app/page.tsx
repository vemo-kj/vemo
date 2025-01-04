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

// Home page
export default function Home() {
    const categories = ['All', 'Education', 'Travel', 'Technology', 'Lifestyle'];
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [mainCards, setMainCards] = useState<MainCardProps[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'All';
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // API
    const fetchMainCards = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5050/home/cards', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch main cards: ${response.status}`);
            }

            const data = await response.json();

            if (!data || !Array.isArray(data.videos)) {
                throw new Error('Invalid data format received from server');
            }

            // 데이터 매핑
            const formattedData: MainCardProps[] = data.videos.map((video: any) => {
                // channel 객체가 없는 경우 기본값 설정
                const channel = video.channel || {};

                return {
                    id: String(video.id || ''),  // 문자열로 변환
                    title: String(video.title || '제목 없음'),
                    thumbnails: String(video.thumbnails || '/default-thumbnail.jpg'),
                    duration: String(video.duration || '00:00'),
                    category: String(video.category || 'Uncategorized'),
                    channel: {
                        id: String(channel.id || ''),
                        thumbnails: String(channel.thumbnails || '/default-channel-thumbnail.jpg'),
                        title: String(channel.title || '채널명 없음'),
                    },
                    vemoCount: Number(video.vemoCount || 0),  // 숫자로 변환
                };
            });

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
        setSelectedCategory(category);
    }, [category]);

    const handleCategoryClick = (category: string) => {
        try {
            if (category === 'All') {
                router.push('/');
            } else {
                router.push(`/?category=${encodeURIComponent(category)}`);
            }
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const filteredCards = mainCards.filter((card) => {
        const matchesCategory =
            selectedCategory === 'All' || card.category === selectedCategory;
        const matchesSearch = !search || card.title.toLowerCase().includes(search.toLowerCase());
        return search ? matchesSearch : matchesCategory;
    });

    return (
        <main className={styles.mainContainer}>
            <Header />
            <Category categories={categories} onCategorySelect={handleCategoryClick} />
            <div className={styles.content}>
                {error ? (
                    <div className={styles.error}>{error}</div>
                ) : isLoading ? (
                    <div className={styles.loading}>로딩 중...</div>
                ) : filteredCards.length > 0 ? (
                    <div className={styles.mainCardContainer}>
                        {filteredCards.map((mainCard) => (
                            <MainCard key={mainCard.id} {...mainCard} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noResults}>표시할 컨텐츠가 없습니다.</div>
                )}
            </div>
        </main>
    );
}
