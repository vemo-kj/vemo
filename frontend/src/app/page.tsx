"use client"

import Category from './components/category/Category';
import Header from './components/Layout/Header';
import styles from './page.module.css';
import { useState } from 'react';

export default function Home() {
    // 카테고리컴포넌트 props
    const categories = ["ALL", "STUDY", "VLOG"]
    const [selectedCategory, setSelectedCategory] = useState('ALL')

    return (
        <main>
            <Category 
            categories={categories}
            onCategorySelect={setSelectedCategory}/>
            <h1>여기는메모카드들이공간예정</h1>
        </main>
    );
}
