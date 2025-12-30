
import React from 'react';
import { Order } from '../../types';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-up overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">#{order.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          
          {/* Status & Date Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Formatted Date</div>
              <div className="font-semibold text-gray-800">{order.date}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</div>
              <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {order.status}
              </div>
            </div>
            {/* System Timestamp - Only if available */}
            {order.createdAt && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">System Timestamp (Server Time)</div>
                <div className="font-mono text-sm text-gray-600">{new Date(order.createdAt).toString()}</div>
              </div>
            )}
          </div>

          {/* Customer & Payment Info - NEW SECTION */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Customer & Payment Info</h3>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
               <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
                  <div className="p-4">
                     <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer Name</div>
                     <div className="text-sm font-semibold text-gray-800">{order.customerName || 'N/A'}</div>
                  </div>
                  <div className="p-4">
                     <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone Number</div>
                     <div className="text-sm font-semibold text-gray-800 font-mono">{order.customerPhone || 'N/A'}</div>
                  </div>
               </div>
               <div className="grid grid-cols-1 border-b border-gray-200">
                  <div className="p-4">
                     <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</div>
                     <div className="text-sm font-semibold text-gray-800">{order.customerEmail || 'N/A'}</div>
                  </div>
               </div>
               <div className="grid grid-cols-2 divide-x divide-gray-200">
                  <div className="p-4 bg-gray-50">
                     <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Method</div>
                     <div className="text-sm font-bold text-gray-900">{order.paymentMethod}</div>
                  </div>
                  <div className="p-4 bg-gray-50">
                     <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transaction ID</div>
                     <div className="text-sm font-bold text-primary font-mono select-all">{order.transactionId || 'N/A'}</div>
                  </div>
               </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Order Items ({order.items.length})</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">Qty: {item.quantity}</span>
                       <span className="text-xs font-bold text-primary">৳{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-sm font-black text-gray-900">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
               <span className="text-sm font-bold text-gray-600">Total Amount</span>
               <span className="text-xl font-black text-primary">৳{order.total.toFixed(2)}</span>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 text-center bg-gray-50/50">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all text-sm shadow-lg shadow-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
