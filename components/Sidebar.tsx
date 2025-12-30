
import React from 'react';
import { View, Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (view: View) => void;
  categories: Category[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, navigate, categories }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[999] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-screen bg-white z-[1000] w-[240px] flex flex-col shadow-[4px_0_20px_rgba(0,0,0,0.05)] transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col items-center justify-center py-[14px] px-[14px] pb-[10px] border-b border-black/10 flex-shrink-0">
          <span className="font-[900] text-[0.95rem] text-[#333] tracking-[0.02em]">MENU BAR</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-[20px_10px]">
          {/* Main Menu */}
          <div className="mb-[20px]">
            <SectionSeparator label="Main Menu" />
            <nav className="list-none m-0 p-0">
              <SidebarLink icon="ri-home-5-line" label="Home" onClick={() => navigate('home')} />
              <SidebarLink icon="ri-store-2-line" label="Shop" onClick={() => navigate('shop')} />
              <SidebarLink icon="ri-shopping-cart-2-line" label="Cart" onClick={() => navigate('cart')} />
              <SidebarLink icon="ri-truck-line" label="Order" onClick={() => navigate('orders')} />
              <SidebarLink icon="ri-admin-line" label="Admin Dashboard" onClick={() => navigate('admin')} />
            </nav>
          </div>

          {/* Categories */}
          <div className="mb-[20px]">
             <SectionSeparator label="Categories" />
            <nav className="list-none m-0 p-0">
              {categories.map(cat => (
                <SidebarLink key={cat.slug} icon={cat.icon} label={cat.name} onClick={() => navigate('shop')} />
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

const SectionSeparator: React.FC<{label: string}> = ({ label }) => (
    <div className="flex items-center justify-center w-full mb-[10px] px-[10px]">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#bbb] mr-[8px]"></div>
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.05em] text-[#9ca3af] whitespace-nowrap">{label}</span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#bbb] to-transparent ml-[8px]"></div>
    </div>
);

const SidebarLink: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <div className="mb-[2px]">
      <div 
        onClick={onClick}
        className="flex items-center no-underline text-[#4b5563] px-[8px] py-[7px] rounded-[6px] text-[0.85rem] font-medium transition-all duration-200 cursor-pointer hover:bg-[#f3f4f6] hover:text-[#000] group"
      >
        <div className="w-[24px] flex justify-center mr-[8px]">
            <i className={`${icon} text-[1.1rem] text-[#9ca3af] group-hover:text-[#111] transition-colors duration-200`}></i>
        </div>
        <span>{label}</span>
      </div>
  </div>
);

export default Sidebar;
