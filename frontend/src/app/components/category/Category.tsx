'use client'
import styles from './Category.module.css'
import { useState } from 'react'

type CategoryProps = {
  categories: string[];
  onCategorySelect: (category: string) => void;
}

export default function Category({categories,  onCategorySelect}: CategoryProps) {

  // 클릭된 카테고리 저장 -> 초기값 All?null? 토의
  const [selectedCategory, setSelectedCategory] = useState<string | null>("All");

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect(category);
  };

  return(
    <div className={styles.mainCategory}>
      <h2>Category</h2>
      <div className={styles.mainCategoryButtonContainer}>
      {categories.map((category, index) => (
        <button
          className={styles.mainCategoryButton}
          key={index}
          onClick={() => handleCategoryClick(category)}
        >
          {category}
        </button>
        ))}
      </div>
    </div>
  )
}
