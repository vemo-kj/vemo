'use client';
import React from 'react';
import styles from './Category.module.css';
import { Category as CategoryType } from '@/app/types/category';

interface CategoryProps {
  categories: readonly CategoryType[];
  onCategoryClick: (category: CategoryType) => void;
}

const Category: React.FC<CategoryProps> = ({ categories, onCategoryClick }) => {
  return (
    <div className={styles.mainCategory}>
      <h2>Category</h2>
      <div className={styles.mainCategoryButtonContainer}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryClick(category)}
            className={styles.mainCategoryButton}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Category;

