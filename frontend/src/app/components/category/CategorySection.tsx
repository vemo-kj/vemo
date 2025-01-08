'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Category from './Category';
import { Category as CategoryType, VALID_CATEGORIES, isValidCategory } from '@/app/types/category';

interface CategorySectionProps {
  selectedCategory: CategoryType;
  onCategorySelect: (category: CategoryType) => void;
}

export function CategorySection({ selectedCategory, onCategorySelect }: CategorySectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryClick = (category: string) => {
    if (!isValidCategory(category)) return;

    const currentSearchParams = new URLSearchParams(window.location.search);
    const currentQuery = currentSearchParams.get('q') || '';

    try {
      if (category === 'All') {
        if (currentQuery) {
          router.push(`/?q=${currentQuery}`);
        } else {
          router.push('/');
        }
      } else {
        if (currentQuery) {
          router.push(`/?category=${encodeURIComponent(category)}&q=${currentQuery}`);
        } else {
          router.push(`/?category=${encodeURIComponent(category)}`);
        }
      }
      onCategorySelect(category);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <Category
      categories={VALID_CATEGORIES}
      onCategoryClick={handleCategoryClick}
    />
  );
} 