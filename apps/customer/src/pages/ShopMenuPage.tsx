import React, { useEffect, useState, useCallback } from 'react';
import { fetchShopMenu, ApiError } from '../api/client';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { ProductCard } from '../components/ProductCard';
import { CartFooter } from '../components/CartFooter';
import { Language } from '../i18n/translations';
import { AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';

interface ShopMenuPageProps {
  slug: string;
  onNavigateToCheckout: () => void;
  onShopLoaded?: (shop: any) => void;
}

type ErrorType = 'NETWORK' | 'NOT_FOUND' | 'MENU_UNAVAILABLE' | 'SERVER';

export const ShopMenuPage: React.FC<ShopMenuPageProps> = ({ slug, onNavigateToCheckout, onShopLoaded }) => {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<Language>('en');

  const loadMenu = useCallback(() => {
    setLoading(true);
    setErrorType(null);
    setErrorMessage(null);

    fetchShopMenu(slug)
      .then((data) => {
        if (!data.shop) {
          setErrorType('NOT_FOUND');
          setErrorMessage(`Shop "${slug}" not found.`);
        } else if (!data.shop.categories || data.shop.categories.length === 0) {
          setErrorType('MENU_UNAVAILABLE');
          setErrorMessage('No menu categories or items are currently available for this shop.');
          setShop(data.shop);
          if (onShopLoaded) onShopLoaded(data.shop);
        } else {
          setShop(data.shop);
          if (onShopLoaded) onShopLoaded(data.shop);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.isNetworkError) {
            setErrorType('NETWORK');
            setErrorMessage('Unable to connect to the QueueLess API server. Please verify the backend is running.');
          } else if (err.status === 404) {
            setErrorType('NOT_FOUND');
            setErrorMessage(err.message || `Shop "${slug}" not found.`);
          } else {
            setErrorType('SERVER');
            setErrorMessage(err.message || 'An error occurred while loading the menu.');
          }
        } else {
          setErrorType('NETWORK');
          setErrorMessage(err.message || 'Failed to connect to the server.');
        }
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#ea580c', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 16, fontWeight: 500 }}>Loading menu...</p>
      </div>
    );
  }

  if (errorType === 'NETWORK') {
    return (
      <div style={{ padding: '40px 20px', maxWidth: 480, margin: '40px auto', textAlign: 'center', background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <AlertCircle size={44} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: '1.25rem' }}>API Connection Error</h3>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: 20 }}>
          {errorMessage || 'Unable to reach the QueueLess API. The server may be starting up or unreachable.'}
        </p>
        <button
          onClick={loadMenu}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            backgroundColor: '#ea580c',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} /> Retry Connection
        </button>
      </div>
    );
  }

  if (errorType === 'NOT_FOUND') {
    return (
      <div style={{ padding: '40px 20px', maxWidth: 480, margin: '40px auto', textAlign: 'center', background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <AlertCircle size={44} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: '1.25rem' }}>Shop Not Found</h3>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {errorMessage || `The requested shop QR code seems invalid or does not exist.`}
        </p>
      </div>
    );
  }

  if (errorType === 'MENU_UNAVAILABLE' && (!shop || !shop.categories || shop.categories.length === 0)) {
    return (
      <div>
        {shop && (
          <Header
            shopName={shop.name}
            isOpen={shop.status === 'OPEN'}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            language={language}
            setLanguage={setLanguage}
          />
        )}
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <ShoppingBag size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Menu Unavailable</h3>
          <p>This shop does not have any active menu items right now.</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#ef4444' }}>
        <h3>Error</h3>
        <p>{errorMessage || 'Failed to load menu.'}</p>
        <button onClick={loadMenu} style={{ marginTop: 12, padding: '8px 16px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  const allProducts = (shop.categories || []).flatMap((cat: any) => cat.products || []);
  
  const currentCategoryObj = selectedCategory
    ? (shop.categories || []).find((c: any) => c.id === selectedCategory)
    : null;

  const filteredProducts = allProducts.filter((product: any) => {
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === '' 
      ? true 
      : product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <Header
        shopName={shop.name}
        isOpen={shop.status === 'OPEN'}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        language={language}
        setLanguage={setLanguage}
      />

      <CategoryNav
        categories={shop.categories || []}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
        language={language}
        totalProductsCount={allProducts.length}
      />

      <div className="category-section-header">
        <h2 className="category-section-title">
          {currentCategoryObj ? `${currentCategoryObj.name} Varieties` : 'All Menu Items'}
        </h2>
        <span className="category-section-count">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <main className="product-list">
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            No products found matching your search.
          </div>
        ) : (
          filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} language={language} />
          ))
        )}
      </main>

      <CartFooter onCheckout={onNavigateToCheckout} language={language} />
    </div>
  );
};
