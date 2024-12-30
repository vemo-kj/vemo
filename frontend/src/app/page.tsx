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


    const fetchMainCards = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/mainCards', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to fetch main cards');
            const data = await response.json();
            setMainCards(data);
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

