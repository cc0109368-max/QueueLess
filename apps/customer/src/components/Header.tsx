import React from 'react';
import { Search } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  shopName: string;
  isOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  shopName,
  isOpen,
  searchQuery,
  setSearchQuery,
  language,
  setLanguage,
}) => {
  const t = translations[language];

  return (
    <header className="header">
      <div className="shop-info">
        <div>
          <h1 className="shop-title">{shopName}</h1>
          <div className="lang-switch">
            {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                className={`lang-btn ${language === lang ? 'active' : ''}`}
                onClick={() => setLanguage(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <span className={`shop-status ${isOpen ? 'open' : 'closed'}`}>
          ● {isOpen ? t.open : t.closed}
        </span>
      </div>

      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </header>
  );
};
