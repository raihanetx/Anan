
import React, { useState } from 'react';
import { CartItem, View, Order, PaymentMethod } from '../types';

interface CheckoutViewProps {
  items: CartItem[];
  navigate: (view: View) => void;
  onPlaceOrder: (order: Order) => void;
  paymentMethods: PaymentMethod[];
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ items, navigate, onPlaceOrder, paymentMethods }) => {
  const [gateway, setGateway] = useState<string>('');
  const [trxId, setTrxId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateway) return alert('Select a payment method!');
    if (!trxId) return alert('Enter transaction ID!');
    if (!formData.name || !formData.phone || !formData.email) return alert('Please fill in all billing information.');
    
    // Create new order object with ALL data
    const newOrder: Order = {
      id: `FLM-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      total: total,
      paymentMethod: gateway,
      transactionId: trxId,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      items: [...items]
    };

    onPlaceOrder(newOrder);
    alert('Order Placed Successfully!');
    navigate('orders');
  };

  const getSelectedMethod = () => paymentMethods.find(pm => pm.name === gateway);

  const handleCopyNumber = () => {
    const method = getSelectedMethod();
    if (method) {
      navigator.clipboard.writeText(method.number);
      alert('Number copied!');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-xl font-bold mb-5 text-gray-900">Secure Checkout</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:items-start">
          {/* Order Summary */}
          <div className="order-1 lg:order-2 lg:col-span-5 bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-[15px] font-bold mb-4 text-gray-900">Order Summary</h2>
            <div className="mb-4">
                {items.map((item, index) => (
                    <div key={item.id} className={`flex gap-3 pb-4 mb-3 ${index < items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="text-[11px] font-semibold text-gray-900">{item.name}</div>
                            <div className="text-[10px] text-gray-500">Qty: {item.quantity} ({item.subtitle})</div>
                        </div>
                        <div className="text-[11px] font-bold flex items-center">৳{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mb-2">
                <span>Subtotal</span><span>৳{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[15px] font-bold text-gray-900 border-t border-gray-100 pt-3 mt-2">
                <span>Total</span><span>৳{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Forms */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col gap-6">
            {/* Billing Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-[15px] font-bold mb-5 text-gray-900">Billing Information</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <FloatingInput 
                  label="Your Name" 
                  placeholder="Name" 
                  id="name" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <FloatingInput 
                  label="Phone Number" 
                  placeholder="Phone" 
                  id="phone" 
                  required 
                  type="tel" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <FloatingInput 
                label="Email Address" 
                placeholder="Email" 
                id="email" 
                required 
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-[15px] font-bold mb-4 text-gray-900">Payment Method</h2>
              <div className="flex flex-wrap items-center gap-5 mb-5 select-none">
                {paymentMethods.map(pm => (
                   <label key={pm.id} className="inline-flex items-center gap-2 cursor-pointer">
                     <input 
                        type="radio" 
                        name="gateway" 
                        value={pm.name} 
                        className="w-3 h-3 accent-primary" 
                        onChange={() => setGateway(pm.name)}
                     />
                     <span className="text-[11px] font-medium text-gray-700">{pm.name}</span>
                   </label>
                ))}
              </div>

              {gateway && getSelectedMethod() && (
                <div className="fade-in mb-5 text-[11px] text-gray-700">
                   {getSelectedMethod()?.is_custom ? (
                        <div className="whitespace-pre-wrap text-sm text-gray-600 font-sans leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {typeof getSelectedMethod()?.instructions === 'string' ? getSelectedMethod()?.instructions : ''}
                        </div>
                   ) : (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <span>Send Money (Personal):</span>
                                <span className="font-bold">{getSelectedMethod()?.number}</span>
                                <button type="button" onClick={handleCopyNumber} className="text-gray-400 hover:text-primary">
                                <i className="ri-file-copy-line"></i>
                                </button>
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-gray-600">
                                <li>First, copy the number shown above.</li>
                                <li>Then open the {gateway} app.</li>
                                <li>Then select 'send money'.</li>
                                <li>Send the amount of money that was requested here.</li>
                                <li>Then copy the transaction ID and paste it below.</li>
                            </ol>
                        </>
                   )}
                </div>
              )}

              <FloatingInput 
                label="Transaction ID" 
                placeholder="Trx" 
                id="trxid" 
                required 
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
               <div className="flex items-center gap-2 mb-2">
                 <input type="checkbox" id="save-info" className="w-3 h-3 accent-primary cursor-pointer" />
                 <label htmlFor="save-info" className="text-[11px] text-gray-600 cursor-pointer select-none">Save this information for next time</label>
               </div>
               <div className="flex items-center gap-2 mb-5">
                 <input type="checkbox" id="terms" className="w-3 h-3 accent-primary cursor-pointer" />
                 <label htmlFor="terms" className="text-[11px] text-gray-600 cursor-pointer select-none">I agree to the <a href="#" className="text-primary font-semibold hover:underline">Terms and Conditions</a></label>
               </div>
               <div className="flex gap-2">
                 <button 
                    type="button" 
                    onClick={() => navigate('cart')}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 font-medium text-[11px] transition-colors"
                 >
                    Cancel Order
                 </button>
                 <button 
                    type="submit"
                    className="flex-1 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-darker font-medium text-[11px] transition-colors"
                 >
                    Place Order
                 </button>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const FloatingInput: React.FC<{ 
  label: string; 
  placeholder: string; 
  id: string; 
  required?: boolean; 
  type?: string; 
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, placeholder, id, required, type = "text", value, onChange }) => (
  <div className="relative w-full">
    <input 
      type={type} 
      id={id} 
      required={required} 
      className="peer block w-full h-8 px-2 border border-gray-300 rounded text-[11px] bg-transparent placeholder-transparent focus:outline-none focus:border-primary focus:ring-0" 
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
    <label 
      htmlFor={id} 
      className="absolute left-2 -top-2 bg-white px-1 text-[10px] text-primary font-medium transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-[11px] peer-placeholder-shown:font-normal peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-primary peer-focus:font-medium"
    >
      {label}
    </label>
  </div>
);

export default CheckoutView;
