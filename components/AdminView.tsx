
import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../supabaseClient';
import { Product, View, Category, Order, PaymentMethod, Review } from '../types';
import ProductFormModal from './admin/ProductFormModal';
import CategoryFormModal from './admin/CategoryFormModal';
import OrderDetailsModal from './admin/OrderDetailsModal';
import InventoryView from './admin/InventoryView';
import PaymentMethodModal from './admin/PaymentMethodModal';
import RelatedProductsManager from './admin/RelatedProductsManager';
import { MediaManager } from './admin/MediaManager';
import DatabaseHelpModal from './admin/DatabaseHelpModal';
import OrderEmailModal from './admin/OrderEmailModal';

interface AdminViewProps {
  products: Product[];
  categories: Category[];
  orders?: Order[];
  refreshData: () => void;
  navigate: (view: View) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ products, categories, orders = [], refreshData, navigate }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'inventory' | 'hot-deals' | 'related' | 'orders' | 'payments' | 'reviews' | 'media'>('products');
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Track deleting state for reviews specifically
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDbHelp, setShowDbHelp] = useState(false);
  
  // Email Modal
  const [selectedOrderForEmail, setSelectedOrderForEmail] = useState<Order | null>(null);
  
  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);

  // Hot Deal State
  const [hotDealUpdates, setHotDealUpdates] = useState<Record<number, { is_hot_deal: boolean, hot_deal_title: string }>>({});

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPaymentMethods();
    }
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  const fetchPaymentMethods = async () => {
    // Read operations can use standard client
    const { data, error } = await supabase.from('payment_methods').select('*').order('id', { ascending: true });
    if (data) setPaymentMethods(data);
    if (error) console.error(error);
  };

  const fetchReviews = async () => {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (data) setReviews(data);
      if (error) console.error(error);
  };

  // --- LOGOUT HELPER ---
  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
        await supabase.auth.signOut();
    }
  };

  // --- HELPERS ---
  const openProductModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsProductModalOpen(true);
  };

  const openCategoryModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsCategoryModalOpen(true);
  };

  const openPaymentModal = (method?: PaymentMethod) => {
    setEditingPayment(method || null);
    setIsPaymentModalOpen(true);
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    try {
        // Use supabaseAdmin to bypass RLS
        const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
        if (error) throw error;
        refreshData();
    } catch (err: any) {
        alert('Delete failed: ' + err.message);
    }
    setLoading(false);
  };

  const deleteCategory = async (id?: number) => {
      if (!id) return;
      if (!confirm('Are you sure? This might break products linked to this category.')) return;
      setLoading(true);
      try {
          const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
          if (error) throw error;
          refreshData();
      } catch (err: any) {
          alert('Delete failed: ' + err.message);
      }
      setLoading(false);
  };
  
  const deletePaymentMethod = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
        const { error } = await supabaseAdmin.from('payment_methods').delete().eq('id', id);
        if (error) throw error;
        fetchPaymentMethods();
    } catch (err: any) {
        alert('Delete failed: ' + err.message);
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setDeletingReviewId(id);
    try {
        const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
        if (error) throw error;
        setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
        alert('Failed to delete review: ' + err.message);
    } finally {
        setDeletingReviewId(null);
    }
  };

  // --- ORDER HELPERS ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
        const { error } = await supabaseAdmin.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (error) throw error;
        refreshData();
    } catch (err: any) {
        alert('Update failed: ' + err.message);
    }
    setLoading(false);
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure?')) return;
    setLoading(true);
    try {
        const { error } = await supabaseAdmin.from('orders').delete().eq('id', orderId);
        if (error) throw error;
        refreshData();
    } catch (err: any) {
        alert('Delete failed: ' + err.message);
    }
    setLoading(false);
  };

  // --- HOT DEAL HELPERS ---
  const toggleHotDeal = (product: Product) => {
    const current = hotDealUpdates[product.id] || { 
      is_hot_deal: product.is_hot_deal || false, 
      hot_deal_title: product.hot_deal_title || '' 
    };
    setHotDealUpdates({
      ...hotDealUpdates,
      [product.id]: { ...current, is_hot_deal: !current.is_hot_deal }
    });
  };

  const updateHotDealTitle = (product: Product, title: string) => {
    const current = hotDealUpdates[product.id] || { 
      is_hot_deal: product.is_hot_deal || false, 
      hot_deal_title: product.hot_deal_title || '' 
    };
    setHotDealUpdates({
      ...hotDealUpdates,
      [product.id]: { ...current, hot_deal_title: title }
    });
  };

  const saveHotDeal = async (productId: number) => {
    const update = hotDealUpdates[productId];
    if (!update) return;
    setLoading(true);
    try {
        const { error } = await supabaseAdmin.from('products').update({ 
            is_hot_deal: update.is_hot_deal,
            hot_deal_title: update.hot_deal_title 
        }).eq('id', productId);
        
        if (error) throw error;
        
        refreshData();
        const newUpdates = { ...hotDealUpdates };
        delete newUpdates[productId];
        setHotDealUpdates(newUpdates);
        alert('Hot Deal updated!');
    } catch (err: any) {
        alert('Update failed: ' + err.message);
    }
    setLoading(false);
  };

  const getSafeString = (val: any) => {
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
      if (typeof val === 'object' && val !== null) return JSON.stringify(val);
      return '';
  };

  const getProductName = (id: number) => {
      const p = products.find(prod => prod.id === id);
      return p ? p.name : `Unknown Product (${id})`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500">Manage products, categories & deals</p>
            <div className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold uppercase tracking-wider ml-2">
               Service Role Active
            </div>
            <button 
                onClick={() => setShowDbHelp(true)}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1 ml-2"
            >
                <i className="ri-database-2-line"></i> Database Setup
            </button>
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 ml-2"
            >
              <i className="ri-logout-box-r-line"></i> Logout
            </button>
          </div>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full custom-scrollbar">
            {['products', 'categories', 'inventory', 'related', 'hot-deals', 'orders', 'payments', 'reviews', 'media'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 md:px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap capitalize ${activeTab === tab ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-black'}`}
                >
                    {tab === 'related' ? 'Cross-Sell' : tab.replace('-', ' ')}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'products' && (
          <>
            <div className="flex justify-end mb-6">
                <button 
                onClick={() => openProductModal()}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-darker transition-all shadow-lg shadow-primary/20"
                >
                <i className="ri-add-line text-xl"></i>
                Add New Product
                </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No products found.</td></tr>
                    ) : (
                    products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                            <img src={p.image || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg object-cover border border-gray-100" alt="" />
                            <div>
                                <div className="font-bold text-gray-900">{p.name}</div>
                                <div className="text-xs text-gray-500 max-w-xs truncate">{getSafeString(p.short_description || p.description)}</div>
                                {p.is_featured && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">Featured</span>}
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{p.category}</span></td>
                        <td className="px-6 py-4">
                            <div className="text-sm font-bold text-primary">৳{p.pricing?.[0]?.price || 0}</div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{p.pricing?.length || 0} Options</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                            <button onClick={() => openProductModal(p)} className="p-2 text-gray-400 hover:text-primary transition-colors"><i className="ri-edit-line text-xl"></i></button>
                            <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><i className="ri-delete-bin-line text-xl"></i></button>
                            </div>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
          </>
      )}

      {activeTab === 'categories' && (
          <div className="animate-fade-in">
              <div className="flex justify-end items-center mb-6">
                <button onClick={() => openCategoryModal()} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-darker transition-all shadow-lg shadow-primary/20"><i className="ri-add-line text-xl"></i> Add Category</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {categories.map(cat => (
                      <div key={cat.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:shadow-lg transition-all group relative">
                           <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-primary/30 transition-colors">
                               <i className={`${cat.icon} text-3xl text-gray-400 group-hover:text-primary transition-colors`}></i>
                           </div>
                           <h3 className="font-bold text-gray-800">{cat.name}</h3>
                           <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => openCategoryModal(cat)} className="p-1.5 bg-gray-100 hover:bg-primary hover:text-white rounded-lg text-gray-500 transition-colors"><i className="ri-edit-line"></i></button>
                               <button onClick={() => deleteCategory(cat.id)} className="p-1.5 bg-gray-100 hover:bg-red-500 hover:text-white rounded-lg text-gray-500 transition-colors"><i className="ri-delete-bin-line"></i></button>
                           </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'inventory' && <InventoryView products={products} refreshData={refreshData} />}

      {activeTab === 'related' && <RelatedProductsManager products={products} refreshData={refreshData} />}

      {activeTab === 'hot-deals' && (
        <div className="animate-fade-in">
           <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
             <i className="ri-information-line text-blue-500 text-xl mt-0.5"></i>
             <div>
               <h3 className="font-bold text-blue-800 text-sm">How it works</h3>
               <p className="text-xs text-blue-600 mt-1">Toggle the switch to enable a product in the "Hot Deals" section.</p>
             </div>
           </div>
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-[300px]">Product</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Is Hot Deal?</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Custom Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map(p => {
                      const pending = hotDealUpdates[p.id];
                      const isHot = pending !== undefined ? pending.is_hot_deal : p.is_hot_deal;
                      const title = pending !== undefined ? pending.hot_deal_title : (p.hot_deal_title || '');
                      const hasChanges = pending !== undefined;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                              <img src={p.image || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-lg object-cover border border-gray-100" alt="" />
                              <div className="min-w-0">
                                  <div className="font-bold text-gray-900 truncate max-w-[200px]">{p.name}</div>
                              </div>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={!!isHot} onChange={() => toggleHotDeal(p)} />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </td>
                          <td className="px-6 py-4">
                             <input type="text" disabled={!isHot} value={getSafeString(title)} onChange={(e) => updateHotDealTitle(p, e.target.value)} placeholder="e.g. Flash Sale" className={`w-full max-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-all ${!isHot ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`} />
                          </td>
                          <td className="px-6 py-4 text-right">
                             {hasChanges && <button onClick={() => saveHotDeal(p.id)} disabled={loading} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold hover:bg-gray-800 transition-colors animate-fade-in">Save</button>}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No orders found.</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4"><div className="font-bold text-gray-900">#{order.id}</div></td>
                      <td className="px-6 py-4"><div className="font-medium text-gray-700">{order.paymentMethod}</div><div className="text-[10px] text-gray-500">{order.customerName || 'N/A'}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-black text-primary">৳{order.total.toFixed(2)}</div></td>
                      <td className="px-6 py-4">
                        {order.status === 'Completed' ? (
                            <div className="flex items-center gap-2">
                                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                    <i className="ri-check-line mr-1"></i> Paid
                                </span>
                                <button 
                                    onClick={() => setSelectedOrderForEmail(order)}
                                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                    title="Send Access Details"
                                >
                                    <i className="ri-mail-send-line text-lg"></i>
                                </button>
                            </div>
                        ) : order.status === 'Cancelled' ? (
                            <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                Cancelled
                            </span>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                                    className="bg-green-500 text-white hover:bg-green-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shadow-green-200"
                                >
                                    Confirm
                                </button>
                                <button 
                                    onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                                    className="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-400 hover:text-primary transition-colors"><i className="ri-eye-line text-xl"></i></button>
                           <button onClick={() => deleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><i className="ri-delete-bin-line text-xl"></i></button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
         <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-gray-800">Payment Gateways</h3>
                  <p className="text-sm text-gray-500">Configure how customers pay at checkout.</p>
                </div>
                <button 
                  onClick={() => openPaymentModal()}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-darker transition-all shadow-lg shadow-primary/20"
                >
                  <i className="ri-bank-card-line text-xl"></i>
                  Add Gateway
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentMethods.map(pm => (
                   <div key={pm.id} className={`bg-white border rounded-2xl p-6 relative group transition-all ${pm.is_active ? 'border-gray-200 hover:border-primary/50 hover:shadow-lg' : 'border-red-100 opacity-70 bg-red-50/10'}`}>
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                            <i className="ri-wallet-3-line text-2xl text-primary"></i>
                         </div>
                         <div className="flex gap-1">
                             <button onClick={() => openPaymentModal(pm)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><i className="ri-edit-line"></i></button>
                             <button onClick={() => deletePaymentMethod(pm.id)} className="p-2 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-500 transition-colors"><i className="ri-delete-bin-line"></i></button>
                         </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{pm.name}</h3>
                      <p className="text-sm text-gray-500 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded mb-3">{pm.number}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                         <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${pm.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {pm.is_active ? 'Active' : 'Inactive'}
                         </span>
                         <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-blue-50 text-blue-600 border-blue-100`}>
                            {pm.is_custom ? 'Custom' : 'Default'}
                         </span>
                      </div>
                   </div>
                ))}
             </div>
         </div>
      )}

      {activeTab === 'reviews' && (
          <div className="animate-fade-in">
             <div className="mb-6">
                <h3 className="font-bold text-gray-800">Customer Reviews</h3>
                <p className="text-sm text-gray-500">Manage all product reviews submitted by users.</p>
             </div>
             
             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Rating</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-[40%]">Comment</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {reviews.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No reviews found.</td></tr>
                    ) : (
                    reviews.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{r.customer_name}</div>
                            <div className="text-[10px] text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-700">{getProductName(r.product_id)}</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex text-yellow-400 text-xs">
                                {[1,2,3,4,5].map(star => (
                                    <i key={star} className={star <= r.rating ? "ri-star-fill" : "ri-star-line text-gray-200"}></i>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 line-clamp-2">{r.comment}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => deleteReview(r.id)} 
                                disabled={deletingReviewId === r.id}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            >
                                {deletingReviewId === r.id ? <i className="ri-loader-4-line animate-spin text-lg"></i> : <i className="ri-delete-bin-line text-lg"></i>}
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
          </div>
      )}

      {activeTab === 'media' && <MediaManager />}

      {/* Modals */}
      <ProductFormModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} product={editingProduct} categories={categories} onSuccess={() => { refreshData(); setIsProductModalOpen(false); }} />
      <CategoryFormModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} category={editingCategory} onSuccess={() => { refreshData(); setIsCategoryModalOpen(false); }} />
      <PaymentMethodModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} method={editingPayment} onSuccess={() => { fetchPaymentMethods(); setIsPaymentModalOpen(false); }} />
      <DatabaseHelpModal isOpen={showDbHelp} onClose={() => setShowDbHelp(false)} />
      {selectedOrder && <OrderDetailsModal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} order={selectedOrder} />}
      {selectedOrderForEmail && <OrderEmailModal isOpen={!!selectedOrderForEmail} onClose={() => setSelectedOrderForEmail(null)} order={selectedOrderForEmail} />}
    </div>
  );
};

export default AdminView;
