'use client'
//style
import styles from './page.module.css';
//component
import Category from './components/category/Category';
import Header from './components/Layout/Header';
import MainCard from './components/mainCard/MainCard';
//type
import { MainCardProps } from './components/mainCard/MainCard';
//next
import { memo, use, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'


// 임시 데이터
// mainCard props , 데이터 기반 렌더링 되도록 작성해야함
const mainCards = [
    {
        thumbnail:"1",
        mainCardTitle:"1",
        youtuberLogo:"1",
        youtuberProfile:"1",
        cardMemoCount:1,
    },
    {
        thumbnail:"2",
        mainCardTitle:"2",
        youtuberLogo:"2",
        youtuberProfile:"2",
        cardMemoCount:2,
    },
    {
        thumbnail:"3",
        mainCardTitle:"3",
        youtuberLogo:"3",
        youtuberProfile:"3",
        cardMemoCount:3,
    },
    {
        thumbnail:"4",
        mainCardTitle:"34",
        youtuberLogo:"4",
        youtuberProfile:"4",
        cardMemoCount:4,
    },
    {
        thumbnail:"5",
        mainCardTitle:"5",
        youtuberLogo:"5",
        youtuberProfile:"5",
        cardMemoCount:5,
    },
]


export default function Home() {
    
    
    // 카테고리컴포넌트 props
    const categories = ["All", "Education", "Travel", "Technology", "Lifestyle","News"]
    const [selectedCategory, setSelectedCategory] = useState('All')
    
    const [cards, setCards] = useState(mainCards)
    const searchParams = useSearchParams()
    const search = searchParams.get('q')
    
    const filteredCards = cards.filter((card: MainCardProps) => card.mainCardTitle.includes(search || ''));

    return (
        <main>
            <Category 
                categories={categories}
                onCategorySelect={setSelectedCategory}/>
            <div className={styles.mainCardContainer}>
                {/* 추가 수정 필요 */}
                {filteredCards.map((mainCard, index) => (
                    <MainCard key={index} {...mainCard} />
                ))}
            </div>
        </main>
    );
}
