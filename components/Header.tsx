
import React from 'react';
import { View } from '../types';

interface HeaderProps {
  navigate: (view: View) => void;
  cartCount: number;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ navigate, cartCount, toggleSidebar }) => {
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-between px-3 md:px-[2rem] h-[50px] md:h-[90px] sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center shrink-0 w-[70px] md:w-auto">
        <div 
          onClick={() => navigate('home')} 
          className="font-black tracking-tighter text-[20px] md:text-[36px] cursor-pointer text-black leading-none"
        >
          FLAME<span className="text-primary">.</span>
        </div>
      </div>

      {/* Search Bar (Desktop) */}
      <form className="hidden md:flex flex-1 justify-center mx-[2rem]" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center border border-gray-300 rounded-full px-6 w-full max-w-2xl bg-transparent h-12 relative transition-all duration-200 focus-within:border-primary">
          <input 
            type="text" 
            placeholder="Search Product" 
            className="w-full outline-none bg-transparent text-lg text-gray-700 placeholder-gray-400 pr-10" 
          />
          <div className="absolute right-[60px] h-7 w-[1px] bg-gray-300"></div>
          <button type="submit" className="absolute right-5 cursor-pointer hover:text-black transition-colors">
            <i className="ri-search-line text-gray-400 text-2xl"></i>
          </button>
        </div>
      </form>

      {/* Search Bar (Mobile) */}
      <form className="md:hidden flex items-center border border-gray-300 rounded-full px-3 bg-white h-[30px] flex-1 mr-6 ml-2 relative focus-within:border-primary" onSubmit={(e) => e.preventDefault()}>
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full outline-none bg-transparent text-xs text-gray-700 placeholder-gray-400 pr-6 pb-[1px]" 
        />
        <div className="absolute right-[30px] h-4 w-[1px] bg-gray-300"></div>
        <button type="submit" className="absolute right-2">
          <i className="ri-search-line text-gray-400 text-[14.5px]"></i>
        </button>
      </form>

      {/* Right Menu Icons */}
      <div className="flex items-center justify-end h-10 shrink-0 md:w-auto">
        {/* Store Icon (Desktop) */}
        <div className="hidden md:flex items-center h-full">
          <div onClick={() => navigate('shop')} className="px-4 cursor-pointer hover:bg-gray-50 rounded-md transition-colors">
            <i className="ri-store-line text-[28px] text-gray-500 hover:text-black leading-none"></i>
          </div>
          <div className="w-[1px] h-7 bg-gray-200"></div>
        </div>

        {/* Cart Icon (Desktop) */}
        <div className="hidden md:flex items-center h-full">
          <div onClick={() => navigate('cart')} className="px-4 cursor-pointer hover:bg-gray-50 rounded-md transition-colors relative">
            <i className="ri-shopping-bag-line text-[28px] text-gray-500 hover:text-black leading-none"></i>
            {cartCount > 0 && (
              <span className="absolute top-1 right-2 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <div className="w-[1px] h-7 bg-gray-200"></div>
        </div>

        {/* Mobile: Cart | Dots */}
        <div className="md:hidden flex items-center h-full">
          <div onClick={() => navigate('cart')} className="pr-2 pl-0 cursor-pointer pb-[2px] relative">
            <i className="ri-shopping-bag-line text-[21.5px] text-gray-500 leading-none"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 right-1 bg-red-600 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <div onClick={toggleSidebar} className="pl-3 pr-2 cursor-pointer">
            <i className="ri-more-2-line text-[20px] text-gray-500 leading-none"></i>
          </div>
        </div>

        {/* Order Icon (Desktop) */}
        <div className="hidden md:flex items-center h-full">
          <div onClick={() => navigate('orders')} className="px-4 cursor-pointer hover:bg-gray-50 rounded-md transition-colors">
            <i className="ri-todo-line text-[28px] text-gray-500 hover:text-black leading-none"></i>
          </div>
          <div className="w-[1px] h-7 bg-gray-200"></div>
        </div>

        {/* Menu Dots (Desktop) */}
        <div className="hidden md:flex items-center h-full">
          <div onClick={toggleSidebar} className="px-4 cursor-pointer hover:bg-gray-50 rounded-md transition-colors">
            <i className="ri-more-2-line text-[28px] text-gray-700 hover:text-primary leading-none"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
