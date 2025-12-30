
import React, { useState } from 'react';
import { Order, View } from '../types';

interface OrdersViewProps {
  orders: Order[];
  navigate: (view: View) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders, navigate }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Order History</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your digital purchases</p>
        </div>
        <button 
          onClick={() => navigate('home')}
          className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all bg-primary/5 px-4 py-2 rounded-lg"
        >
          <i className="ri-arrow-left-line"></i> Shop More
        </button>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-history-line text-4xl text-gray-200"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your history here!</p>
            <button 
              onClick={() => navigate('home')}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-darker transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              {/* Card Header */}
              <div className="p-5 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
                <div className="flex gap-6">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Order ID</div>
                    <div className="text-sm font-black text-gray-900">#{order.id}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Placed On</div>
                    <div className="text-sm font-medium text-gray-600">{order.date}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 ml-auto">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total</div>
                    <div className="text-sm font-black text-primary">৳{order.total.toFixed(2)}</div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </div>
              
              {/* Order Items Summary */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3 overflow-hidden">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div key={item.id} className="inline-block h-10 w-10 rounded-lg ring-2 ring-white overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500 ring-2 ring-white border border-gray-200">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => toggleOrder(order.id)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary transition-colors"
                  >
                    {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                    <i className={expandedOrderId === order.id ? 'ri-arrow-up-s-line text-lg' : 'ri-arrow-down-s-line text-lg'}></i>
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedOrderId === order.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100 animate-slide-down">
                    <div className="grid md:grid-cols-3 gap-8">
                      {/* Items list */}
                      <div className="md:col-span-2 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items Summary</h4>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 leading-tight truncate">{item.name}</h4>
                              <p className="text-[10px] text-gray-500 font-medium">{item.subtitle} • Qty: {item.quantity}</p>
                            </div>
                            <div className="text-xs font-bold text-gray-900 font-poppins">
                              ৳{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment details */}
                      <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Method</span>
                            <span className="text-xs font-bold text-gray-900">{order.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Subtotal</span>
                            <span className="text-xs font-bold text-gray-900">৳{order.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-primary pt-2 border-t border-gray-200">
                            <span className="text-xs font-bold">Paid Total</span>
                            <span className="text-sm font-black">৳{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100 text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
                          <p className="text-xs font-bold text-green-600">Verified & Secure</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="mt-6 flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-50">
                  <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                    <i className="ri-file-download-line text-base"></i>
                    Invoice
                  </button>
                  <button 
                    onClick={() => navigate('home')}
                    className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-darker transition-all shadow-sm shadow-primary/10"
                  >
                    <i className="ri-refresh-line text-base"></i>
                    Reorder Items
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const styles = {
    Completed: 'bg-green-50 text-green-600 border-green-100',
    Pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    Processing: 'bg-blue-50 text-blue-600 border-blue-100',
    Cancelled: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${styles[status]}`}>
      {status}
    </span>
  );
};

export default OrdersView;
