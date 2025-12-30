
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOpen: () => void;
  onAdd: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpen, onAdd }) => {
  const safeDescription = typeof product.description === 'string' ? product.description : '';

  return (
    <div 
      className="border-1 border-gray-200 card-rounded flex flex-col cursor-pointer w-[168px] h-[226px] flex-shrink-0 md:w-[189px] md:h-[247px] bg-white group"
    >
      <div className="contents" onClick={onOpen}>
        <div className="w-full h-[50%] overflow-hidden rounded-t-[0.52rem] relative">
          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
          {product.stock_out && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
              Stock Out
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-between flex-1 px-[8.5px] pt-[8.5px] pb-[4.5px]">
          <div className="flex flex-col gap-[8.5px]">
            <h3 className="text-[13.5px] md:text-[14.5px] font-bold text-gray-800 truncate font-poppins">
              {product.name}
            </h3>
            <p className="text-[11.5px] md:text-[11.5px] text-gray-500 leading-snug line-clamp-2 bangla-text">
              {safeDescription}
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="price-text text-[14.7px] md:text-[16.8px] text-primary">
              <span className="price-symbol-bn">&#2547;</span>
              {product.pricing[0]?.price || 0} Taka
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="bg-transparent border-none p-0 cursor-pointer"
              disabled={product.stock_out}
            >
              <i className="ri-add-line text-[21px] md:text-[23px] text-black hover:text-primary transition-colors"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
