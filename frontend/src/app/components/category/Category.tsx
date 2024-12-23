"use client"

import Link from 'next/link'
import styles from './Category.module.css'
import { useState } from 'react'

type CategoryProps = {
  categories: string[];
  onCategorySelect: (category: string) => void;
}

export default function Category({categories,  onCategorySelect}: CategoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect(category);
  };

  return(
    <div className={styles.mainCategory}>
      <h1>CATEGORY</h1>
      <div>
      {categories.map((category, index) => (
        <button
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
