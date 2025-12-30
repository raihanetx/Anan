
import React from 'react';
import { CartItem, View } from '../types';

interface CartViewProps {
  items: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  navigate: (view: View) => void;
}

const CartView: React.FC<CartViewProps> = ({ items, updateQuantity, removeItem, navigate }) => {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[495px] mx-auto px-4 py-4 fade-in">
        <h1 className="text-[18px] font-bold mb-3.5 text-black">Shopping Cart</h1>
        <div className="text-center py-12">
          <i className="ri-shopping-cart-line text-6xl text-gray-300 mb-4 block"></i>
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button 
            onClick={() => navigate('home')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-darker transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[495px] mx-auto px-4 py-4 fade-in">
      <h1 className="text-[18px] font-bold mb-3.5 text-black">Shopping Cart</h1>
      
      <div className="mb-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center border border-[#e5e7eb] rounded-xl p-3 mb-3 bg-white">
            <div className="flex items-center gap-3 flex-grow">
              <img src={item.image} className="w-[48px] h-[48px] rounded-lg object-cover border border-[#f0f0f0] flex-shrink-0" alt={item.name} />
              <div className="flex flex-col justify-center">
                <div className="text-[12px] font-semibold mb-0.5 text-[#111]">{item.name}</div>
                <div className="text-[9.5px] text-[#666] mb-0.5">{item.subtitle}</div>
                <div className="text-[11px] font-bold text-black">৳{item.price.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pl-2">
              <div className="flex items-center">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-[19px] h-[19px] flex items-center justify-center text-lg text-[#555] cursor-pointer"
                >
                  <i className="ri-subtract-line text-sm"></i>
                </button>
                <span className="text-[11px] font-medium mx-1.5 min-w-[10px] text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-[19px] h-[19px] flex items-center justify-center text-lg text-[#555] cursor-pointer"
                >
                  <i className="ri-add-line text-sm"></i>
                </button>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-sm text-[#888] hover:text-[#ff4d4f] p-1"
              >
                <i className="ri-delete-bin-line text-[11px]"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-[#e5e7eb] rounded-xl p-3.5 mt-2.5">
        <div className="text-[16px] font-semibold mb-3">Order Summary</div>
        <div className="flex justify-between mb-2 text-[11px] text-[#333]">
          <span>Subtotal</span>
          <span>৳{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-[#eee] pt-2 font-bold text-[13px] mb-3.5">
          <span>Total</span>
          <span>৳{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('home')}
            className="flex-1 py-2 bg-white border border-primary text-primary hover:bg-violet-50 rounded-md text-center text-[11px] font-medium cursor-pointer transition-colors"
          >
            Continue Shopping
          </button>
          <button 
            onClick={() => navigate('checkout')}
            className="flex-1 py-2 bg-primary hover:bg-primary-darker text-white rounded-md text-center text-[11px] font-medium cursor-pointer transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartView;
