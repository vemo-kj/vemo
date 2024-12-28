'use client';
import styles from './Category.module.css';

type CategoryProps = {
  categories: string[];
  onCategorySelect: (category: string) => void;
};

export default function Category({ categories, onCategorySelect }: CategoryProps) {
  return (
    <div className={styles.mainCategory}>
      <h2>Category</h2>
      <div className={styles.mainCategoryButtonContainer}>
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => onCategorySelect(category)}
            className={styles.mainCategoryButton}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}