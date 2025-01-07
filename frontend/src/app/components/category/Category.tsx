'use client';
import React from 'react';
import styles from './Category.module.css';

interface CategoryProps {
  categories: string[];
  onCategoryClick: (category: string) => void;
}

const Category: React.FC<CategoryProps> = ({ categories, onCategoryClick }) => {
  return (
    <div className={styles.mainCategory}>
      <h2>Category</h2>
      <div className={styles.mainCategoryButtonContainer}>
        {categories.map((category, index) => (
          <button
            key={index}
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

