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
            console.log(response);
            if (!response.ok) throw new Error('Failed to fetch main cards');
            
            const data = await response.json();

            // 데이터 매핑
            const formattedData: MainCardProps[] = data.videos.map((video: any) => ({
                id: video.id,
                title: video.title,
                thumbnails: video.thumbnails,
                duration: video.duration,
                category: video.category,
                channel: {
                    id: video.channel.id,
                    thumbnails: video.channel.thumbnails,
                    title: video.channel.title,
                },
                vemoCount: video.vemoCount,
            }));
            setMainCards(formattedData);
        } catch (error) {
            setError('데이터를 불러오는데 실패했습니다.');
            console.error('Error fetching main cards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMainCards();
    }, []);

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);

        if (category === 'All') {
            router.push('/');
        } else {
            router.push(`/?category=${encodeURIComponent(category)}`);
        }
    };

    const filteredCards = mainCards.filter((card) => {
        const matchesCategory =
            selectedCategory === 'All' || card.category === selectedCategory;

        const matchesSearch =
            search !== '' ? card.title.includes(search) : true;

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
            {error ? (
                <div>{error}</div>
            ) : isLoading ? (
                <div>로딩 중</div>
            ) : (
                <div className={styles.mainCardContainer}>
                    {filteredCards.map((mainCard, index) => (
                        <MainCard key={index} {...mainCard} />
                    ))}
                </div>
            )}
        </main>
    );
}