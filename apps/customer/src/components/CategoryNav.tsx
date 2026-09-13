import React from 'react';
import { Language, translations } from '../i18n/translations';

export interface Category {
  id: string;
  name: string;
  products?: any[];
}

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  language: Language;
  totalProductsCount?: number;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  language,
  totalProductsCount,
}) => {
  const t = translations[language];

  return (
    <nav className="categories-scroll" aria-label="Menu categories">
      <button
        className={`category-tab ${selectedCategoryId === null ? 'active' : ''}`}
        onClick={() => onSelectCategory(null)}
      >
        <span>{t.allCategories}</span>
        {totalProductsCount !== undefined && (
          <span className="category-count">{totalProductsCount}</span>
        )}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`category-tab ${selectedCategoryId === cat.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.id)}
        >
          <span>{cat.name}</span>
          {cat.products && (
            <span className="category-count">{cat.products.length}</span>
          )}
        </button>
      ))}
    </nav>
  );
};
