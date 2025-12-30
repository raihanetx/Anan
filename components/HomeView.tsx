
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_SITE_CONFIG } from '../constants';
import { Product, View, Category } from '../types';
import ProductCard from './ProductCard';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  navigate: (view: View, product?: Product) => void;
  addToCart: (product: Product) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ products, categories, navigate, addToCart }) => {
  const [activeHero, setActiveHero] = useState(0);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Hero Slider logic
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero(prev => (prev + 1) % MOCK_SITE_CONFIG.hero_banner.length);
    }, MOCK_SITE_CONFIG.hero_slider_interval);
    return () => clearInterval(timer);
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      categoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Filter for Hot Deals (Featured or not, Hot Deals are separate)
  const hotDealProducts = products.filter(p => p.is_hot_deal);
  
  // Strict rule: Only show categories that have FEATURED products
  // And in those categories, only show the FEATURED products.
  const featuredProducts = products.filter(p => p.is_featured);
  const featuredCategoryNames = Array.from(new Set(featuredProducts.map(p => p.category)));

  // Double list for infinite scroll animation
  const infiniteHotDeals = [...hotDealProducts, ...hotDealProducts];

  if (products.length === 0 && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 fade-in">
        <div className="bg-primary/5 p-6 rounded-full mb-6">
          <i className="ri-database-2-line text-4xl text-primary"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Database Connected</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Your store is connected to Supabase but currently has no products. 
          Head over to the Admin Dashboard to start adding your inventory.
        </p>
        <button 
          onClick={() => navigate('admin')}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-darker transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <i className="ri-dashboard-line"></i>
          Go to Admin Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section aspect-[2/1] md:aspect-[5/2] rounded-lg overflow-hidden">
        <div className="relative w-full h-full">
          {MOCK_SITE_CONFIG.hero_banner.map((url, i) => (
            <div 
              key={i}
              className={`hero-slide ${i === activeHero ? 'active' : ''}`}
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {MOCK_SITE_CONFIG.hero_banner.map((_, i) => (
            <button 
              key={i}
              onClick={() => setActiveHero(i)}
              className={`w-2.5 h-2.5 rounded-full transition ${i === activeHero ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative">
        <div className="text-center mt-6 mb-6 md:mt-8 md:mb-8">
          <h2 className="text-2xl font-bold text-gray-800 font-display tracking-wider">Product Categories</h2>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="relative flex items-center justify-center gap-2 md:px-0">
            <button 
                onClick={() => scrollCategories('left')}
                className="hidden md:flex p-2 flex-shrink-0 z-10 items-center justify-center"
            >
                <i className="fas fa-chevron-left text-2xl text-gray-500 hover:text-primary transition-colors"></i>
            </button>
            <div className="overflow-hidden">
                <div ref={categoryScrollRef} className="horizontal-scroll smooth-scroll">
                    <div className="category-scroll-container">
                        {categories.map(cat => (
                            <a 
                                key={cat.slug} 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); navigate('shop'); }} 
                                className="category-icon"
                            >
                                <i className={cat.icon}></i>
                                <span>{cat.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <button 
                onClick={() => scrollCategories('right')}
                className="hidden md:flex p-2 flex-shrink-0 z-10 items-center justify-center"
            >
                <i className="fas fa-chevron-right text-2xl text-gray-500 hover:text-primary transition-colors"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      {hotDealProducts.length > 0 && (
        <section className="py-6 md:py-8">
           <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl font-bold font-display tracking-wider">Hot Deals</h2>
          </div>
          <div className="hot-deals-container">
            <div className="hot-deals-scroller" style={{ animationDuration: `${MOCK_SITE_CONFIG.hot_deals_speed}s` }}>
              {infiniteHotDeals.map((product, index) => (
                <a 
                    key={`${product.id}-${index}`} 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('details', product); }} 
                    className="hot-deal-card"
                >
                    <div className="hot-deal-image-container">
                        <img src={product.image} className="hot-deal-image" alt={product.name}/>
                    </div>
                    <span className="hot-deal-title">{product.hot_deal_title || product.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products by Category */}
      {/* Logic: Only show categories that contain FEATURED products, and only show FEATURED products within them */}
      <div>
        {featuredCategoryNames.map(catName => (
          <section key={catName} className="py-6">
            <div className="flex justify-between items-center mb-4 px-4 md:px-6">
              <h2 className="text-2xl font-bold font-display tracking-wider">{catName}</h2>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('shop'); }} 
                className="text-primary font-bold flex items-center text-lg"
              >
                View all &raquo;
              </a>
            </div>
            <div className="horizontal-scroll smooth-scroll">
              <div className="product-scroll-container">
                {products
                  .filter(p => p.category === catName && p.is_featured)
                  .map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onOpen={() => navigate('details', product)}
                      onAdd={() => addToCart(product)}
                    />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default HomeView;
