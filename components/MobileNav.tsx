
import React from 'react';
import { View } from '../types';

interface MobileNavProps {
  navigate: (view: View) => void;
  cartCount: number;
}

const MobileNav: React.FC<MobileNavProps> = ({ navigate, cartCount }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-1px_4px_rgba(0,0,0,0.08)] h-[55px] flex justify-around items-center md:hidden z-50">
      <NavItem 
        icon="ri-home-4-line" 
        label="Home" 
        onClick={() => navigate('home')} 
        showDivider
      />
      <NavItem 
        icon="ri-store-line" 
        label="Shop" 
        onClick={() => navigate('shop')} 
        showDivider
      />
      <NavItem 
        icon="ri-shopping-cart-2-line" 
        label="Cart" 
        onClick={() => navigate('cart')} 
        badgeCount={cartCount}
      />
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; onClick: () => void; showDivider?: boolean; badgeCount?: number }> = ({ icon, label, onClick, showDivider, badgeCount }) => (
  <div 
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer relative ${showDivider ? 'after:content-[""] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-[25px] after:w-[1px] after:bg-gray-300' : ''}`}
  >
    <div className="relative">
      <i className={`${icon} text-[20px] mb-[1px] leading-none text-gray-500`}></i>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[8px] font-bold rounded-full h-3 w-3 flex items-center justify-center">
          {badgeCount}
        </span>
      )}
    </div>
    <span className="text-[10px] font-medium text-gray-500 leading-none">{label}</span>
  </div>
);

export default MobileNav;
