export const VALID_CATEGORIES = ['All', 'Education', 'Travel', 'Technology', 'Lifestyle'] as const;
export type Category = typeof VALID_CATEGORIES[number];

export const isValidCategory = (category: string): category is Category => {
  return VALID_CATEGORIES.includes(category as Category);
}; 