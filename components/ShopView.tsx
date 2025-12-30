
import React from 'react';
import { Product, View } from '../types';
import ProductCard from './ProductCard';

interface ShopViewProps {
  products: Product[];
  navigate: (view: View, product?: Product) => void;
  addToCart: (product: Product) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ products, navigate, addToCart }) => {
  // Logic: Show ALL products (Featured + Non-Featured)
  const shopProducts = products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">Shop All Products</h1>
        <p className="text-gray-500">Discover our complete collection of digital assets</p>
      </div>

      {shopProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-store-line text-4xl text-gray-200"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800">No items in the shop</h3>
            <p className="text-gray-500 mb-6">Check back later for new products.</p>
            <button 
              onClick={() => navigate('home')}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-darker transition-all"
            >
              Go Home
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 justify-items-center">
          {shopProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onOpen={() => navigate('details', product)}
              onAdd={() => addToCart(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopView;
