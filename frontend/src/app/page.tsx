"use client"

import Category from './components/category/Category';
import Header from './components/Layout/Header';
import MainCard from './components/mainCard/MainCard';
import styles from './page.module.css';
import { useState } from 'react';

export default function Home() {
    // 카테고리컴포넌트 props
    const categories = ["ALL", "STUDY", "VLOG"]
    const [selectedCategory, setSelectedCategory] = useState('ALL')

    // mainCard props
    const mainCards = [
        {
            thumbnail:"1",
            mainCardTitle:"1",
            youtuberLogo:"1",
            youtuberProfile:"1",
            cardMemoCount:1,
        },
    ]

    return (
        <main>
            <Category 
            categories={categories}
            onCategorySelect={setSelectedCategory}/>
            <div>
                {mainCards.map((mainCard, index) => (
                    <MainCard key={index} {...mainCard} />
                ))}
            </div>
        </main>
    );
}
